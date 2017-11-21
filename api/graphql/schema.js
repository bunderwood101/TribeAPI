import { makeExecutableSchema } from 'graphql-tools';
import query from './queries/queries'
import Post from './types/blog-post';
import PostInput from './types/blog-post-input';
import User from './types/user';
import UserInput from './types/user-input';
import UserLoginInput from './types/user-login-input';
import mongoose from 'mongoose'
// import {modelpost} from '../models/post'
 import {modelcomment} from '../models/Comment'
import {modelUser} from '../models/user';
import { PubSub, withFilter } from 'graphql-subscriptions';
import authenticate from '../authentication'
var ObjectId = require('mongodb').ObjectID;
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {_,merge} from 'lodash'
import * as Tweet from '../twitter/schema'


// TODO Seperate queries, mutations and resolvers into GRAPHQL Type. The schema should contain no data fetching etc.
// see https://marmelab.com/blog/2017/09/06/dive-into-graphql-part-iii-building-a-graphql-server-with-nodejs.html#start-with-a-schema
// OR resolvers -> Models -> Connectors -> Schemas?


// get the default connection
var dbconn = mongoose.connection;
mongoose.Promise = global.Promise

// get mongo collectins
const Posts = dbconn.collection('posts')
const Comments = modelcomment
const Users = modelUser
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
    user(email: String!) : User
    tweet(id: String!) : Tweet
    tweets(searchArgs: String!, count: Int) : [Tweet]

  }
`;

const Mutations = `
  type Mutation {
    createPost(post: PostInput!) : Post
    updatePost(_id: ID!, input: PostInput) : Post
    createComment(postId: String, content: String) : Comment
    signup(user: UserInput!) : User
    login(user: UserLoginInput!) : User
  }
`;

const Subscriptions = `
  type Subscription {
    postCreated : Post
  }
`
const pubsub = new PubSub()


// TODO implement apllo-resolvers to create reusable functions for use here. EG. authorization
// see https://github.com/thebigredgeek/apollo-resolvers
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
    user: async (root, {email}) => {
      let Users = dbconn.collection('users')
      return prepare(await Users.findOne({email: email}))
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
      // TODO change subscription to use newly inserted item
      pubsub.publish('postCreated', { postCreated : args.post})
      return prepare(await Posts.findOne({_id: res.insertedIds[0]}),'password')
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
    login: async(root, args, context, info) => {
       const req = args.user
        return prepare(await Users.findOne({'email':req.email},'+password').then((user) => {
          if(user){
            // validate password
            return bcrypt.compare(req.password, user.password).then((res) => {
            if (res) {
              // create jwt
              const token = jwt.sign({id: user._id, email: user.email}, process.env.SECRET);
              user.jwt = token;
              context.user = Promise.resolve(user);
              return user;
            }
            return Promise.reject('password incorrect')
          })
        }
        return Promise.reject('email not found')
      }))
    },
    signup: async(root, args, context, info) => {
      const req = args.user
      // find user by email
      return Users.findOne({'email':req.email}).then((existing) => {
        if (!existing) {
          console.log("not existing: ", existing)
          // hash password and create user
          return  Users.create({
            email: req.email,
            firstname: req.firstname,
            surname: req.surname,
            enabled: req.enabled || true,
            locked: req.locked || false,
            password: req.password,
          }).then((user) => {
            console.log("req is valid: ", req)
            const { id } = user;
            const token = jwt.sign({ id:user._id, email: user.email }, process.env.SECRET);
            user.jwt = token;
            context.user = Promise.resolve(user);
            return user;
          });
        }
        console.log("existing: ", existing)
        return Promise.reject('email already exists'); // email already exists
      })
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

const mergedResolvers = merge(resolvers, Tweet.resolvers)

export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition, RootQuery, Mutations, Subscriptions,
    // ellipsis destructure array imported from the blog-post.js file as typeDefs only accepts an array of strings or functions
    ...Post, PostInput, User, UserInput, UserLoginInput, ...Tweet.schema
  ],
  resolvers: mergedResolvers,
  logger: { log: e => console.log(e)}
});
