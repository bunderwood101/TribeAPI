import { makeExecutableSchema } from 'graphql-tools';
import Post from './types/blog-post';
import PostInput from './types/blog-post-input';
import mongoose from 'mongoose'
var ObjectId = require('mongodb').ObjectID;

//Set up default mongoose connection
var mongoDB = 'mongodb://rw:vCI2yaDowOaPtMu3@sandbox-shard-00-00-u9lfk.mongodb.net:27017,sandbox-shard-00-01-u9lfk.mongodb.net:27017,sandbox-shard-00-02-u9lfk.mongodb.net:27017/test?ssl=true&replicaSet=sandbox-shard-0&authSource=admin';
mongoose.connect(mongoDB, {
  useMongoClient: true,
  promiseLibrary: global.Promise
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Posts = db.collection('posts')
const Comments = db.collection('comments')

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
  }
`;



const Mutations = `
  type Mutation {
    createPost(post: BlogPostInput!) : Post
    updatePost(_id: ID!, input: BlogPostInput) : Post
    createComment(postId: String, content: String) : Comment
  }
`;

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
      console.log(res.insertedIds[0])
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
  },
}

const SchemaDefinition = `
  schema {
    query: RootQuery,
    mutation: Mutation
  }
`;
export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition, RootQuery, PostInput, Mutations,
    // we have to destructure array imported from the blog-post.js file
    // as typeDefs only accepts an array of strings or functions
    ...Post

  ],
  // we could also concatenate arrays
  // typeDefs: [SchemaDefinition, RootQuery].concat(Post)
  resolvers: resolvers,
});
