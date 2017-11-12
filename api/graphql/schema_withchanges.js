import { makeExecutableSchema } from 'graphql-tools';
import Post from './types/blog-post';
import PostInput from './types/blog-post-input';
import User from './types/user';
import UserInput from './types/user-input';
import UserLoginInput from './types/user-login-input';
import mongoose from 'mongoose'
import {modelpost} from '../models/Post'
import {modelcomment} from '../models/Comment'
import {modeluser} from '../models/User'
import { PubSub, withFilter } from 'graphql-subscriptions';
import authenticate from '../authentication'
var ObjectId = require('mongodb').ObjectID;

// get the default connection
var dbconn = mongoose.connection;
mongoose.Promise = global.Promise

// get mongo collectins

const Comments = modelcomment
const Users = modeluser
const Posts = modelpost


const prepare = (o) => {
  // no longer needed as _id is being stored as an actual ID
  //o._id = o._id.toString()
  return o
}

const RootQuery = `
  type RootQuery {
    getPost(_id: ID!): Post
    getPosts: [Post]
    getComment(_id: String) : Comment
    getUser(_id: ID!) : User
  }
`;

const Mutations = `
  type Mutation {
    createPost(post: PostInput!) : Post
    updatePost(_id: ID!, input: PostInput!) : Post
    createComment(postId: String, content: String) : Comment
    createUser(user: UserInput!) : User
    login(user: UserLoginInput!) : User
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
    getPost: async (root, {_id}) => {
      var a = await Post.find({postID:_id})
      console.log(a)
      return a
    },
    getPosts: async (root) => {
     return prepare(await Post.find({}).toArray()).map(prepare)
    },
    getComment:async (root, {_id}) => {
     return prepare(await Comments.findOne(ObjectId(_id)))
   },
   getUser: async (root, {_id}) => {
      return prepare(await Users.findOne(ObjectId(_id)))
    }
  },
  Post: {
    comments: async ({postId}) => {
      return prepare(await Post.findOne(ObjectId(postId)))
    }
  },
  Comment: {
    post: async ({postId}) => {
        return prepare(await Comments.find({postId: _id}).toArray()).map(prepare)
    }
  },
  Mutation: {
    createPost: async(root, args, context, info) => {
      const res = await Post.create(args.post)
      // pubsub.publish('postCreated', { postCreated : args.post})
      return prepare(await Post.findOne({_id: res._id}))
    },
    updatePost: async(root, args, context, info) => {
      if(!Posts[id]){
        throw new Error('no post exists with id ' + _id);
      }
      const res = await Post.update(args.post)
      return await Post.findOne({_id: res._id})
    },
    createComment: async (root, args) => {
      const res = await Comments.create(args)
      return await Comments.findOne({_id: res._id})
    },
    // TODO validation on create
    createUser: async(root, args, context, info) => {
      const res = await Users.create(args.user)
      return await Users.findOne({_id: res._id})
    },
    login: async(root, args, context, info) => {
       const req = args.user
        return prepare(await Users.findOne({'email':req.email}, function( err, user) {
          if (err){
            console.error(err)
          }
          else if(!user){
            console.log("no results")
          }
          else{
            return(authenticate.hashPassword(req.password))
            authenticate.comparePassword(req.password,user.password)
          }
        }))
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
    ...Post, PostInput, User, UserInput, UserLoginInput
  ],
  resolvers: resolvers,
});
