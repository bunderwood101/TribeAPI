// //unsure why this needs it's own type. TBC
//
// import {
//   GraphQLInputObjectType,
//   GraphQLString,
//   GraphQLID
// } from 'graphql';

// export default new GraphQLInputObjectType({
//   name: 'BlogPostInput',
//   fields: () => ({
//     _id: {type: GraphQLID},
//     title: {type: new GraphQLNonNull(GraphQLString)},
//     content: {type: new GraphQLNonNull(GraphQLString)},
//     author: {type: new GraphQLNonNull(GraphQLString)},
//     //relatedBlogs: { type: new GraphQLList(blog-post-attributes as in ID) }
//   })
// });

const BlogPostInput = `
  input BlogPostInput {
    title: String
    content: String
    author: String

  }
`;

export default BlogPostInput;
