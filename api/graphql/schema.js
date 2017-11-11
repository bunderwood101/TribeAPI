import { makeExecutableSchema } from 'graphql-tools';
import Post from './types/blog-post';
import PostInput from './types/blog-post-input';
import User from './types/user';
import UserInput from './types/user-input';
import mongoose from 'mongoose'
import { PubSub, withFilter } from 'graphql-subscriptions';
var ObjectId = require('mongodb').ObjectID;

// get the default connection
var dbconn = mongoose.connection;

// get mongo collectins
const Posts = dbconn.collection('posts')
const Comments = dbconn.collection('comments')
const Users = dbconn.collection('users')

const prepare = (o) => {
  // no longer needed as _id is being stored as an actual ID
  //o._id = o._id.toString()
  return o
}

const RootQuery = `
  type RootQuery {
    post(_id: ID!): Post
    posts: [Post]
    comment(_id: String) : Comment
    user(_id: ID!) : User
  }
`;

const Mutations = `
  type Mutation {
    createPost(post: BlogPostInput!) : Post
    updatePost(_id: ID!, input: BlogPostInput) : Post
    createComment(postId: String, content: String) : Comment
    createUser(user: UserInput!) : User
  }
`;

const Subscriptions = `
  type Subscription {
    postCreated : Post
  }
`
const pubsub = new PubSub()

const resolvers = {
  RootQuery: {
    post: async (root, {_id}) => {
      return prepare(await Posts.findOne(ObjectId(_id)))
    },
    posts: async () => {
     return prepare(await Posts.find({}).toArray()).map(prepare)
    },
    comment:async (root, {_id}) => {
     return prepare(await Comments.findOne(ObjectId(_id)))
   },
   user: async (root, {_id}) => {
      return prepare(await Users.findOne(ObjectId(_id)))
    }
  },
  Post: {
    comments: async ({postId}) => {
      return prepare(await Posts.findOne(ObjectId(postId)))
    }
  },
  Comment: {
    post: async ({postId}) => {
        return prepare(await Comments.find({postId: _id}).toArray()).map(prepare)
    }
  },
  Mutation: {
    createPost: async(root, args, context, info) => {
      const res = await Posts.insert(args.post)
      pubsub.publish('postCreated', { postCreated : args.post})
      return prepare(await Posts.findOne({_id: res.insertedIds[0]}))
    },
    updatePost: async(root, args, context, info) => {
      if(!Posts[id]){
        throw new Error('no post exists with id ' + _id);
      }
      const res = await Posts.update(args)
      return prepare(await Posts.findOne({_id: res.updatedIds[1]}))
    },
    createComment: async (root, args) => {
      const res = await Comments.insert(args)
      return prepare(await Comments.findOne({_id: res.insertedIds}))
    },
    createUser: async(root, args, context, info) => {
      const res = await Users.insert(args.user)
      return prepare(await Users.findOne({_id: res.insertedIds[0]}))
    }
  },
  Subscription: {
    postCreated : {
      // can add withFilter here to, for example only return a particular hashtag
      subscribe: (
        () => pubsub.asyncIterator('postCreated')
      )
    }
  }
}

const SchemaDefinition = `
  schema {
    query: RootQuery,
    mutation: Mutation,
    subscription: Subscription
  }
`;
export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition, RootQuery, Mutations, Subscriptions,
    // ellipsis destructure array imported from the blog-post.js file as typeDefs only accepts an array of strings or functions
    ...Post, PostInput, User, UserInput
  ],
  resolvers: resolvers,
});
