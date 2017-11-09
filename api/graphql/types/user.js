const User = `
  type User {
    _id: ID!
    email: String!
    firstname: String!
    surname: String!
    enabled: Boolean!
    locked: Boolean!
    password: String!
  }
`;
export default User;
