import Comment from './comment';
const Post = `
  type Post @cacheControl(maxAge: 30){
    _id: ID!
    title: String
    content: String
    author: String
    comments: [Comment]
  }
`;
// we export Post and all types it depends on
// in order to make sure we don't forget to include
// a dependency
export default [Post, Comment];
