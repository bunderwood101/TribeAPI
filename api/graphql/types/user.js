const User = `
  type User {
    _id: ID!
    email: String!
    firstname: String!
    surname: String!
    enabled: Boolean!
    locked: Boolean!
    password: String
    jwt: String
  }
`;
export default User;


// TODO should we remove password from the GraphqL schema?
