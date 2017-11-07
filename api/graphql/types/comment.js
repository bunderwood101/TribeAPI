const Comment = `
  type Comment {
    _id: ID!
    postId: Post
    message: String
    author: String
    post: Post
  }
`;
export default Comment;
