const HEADER_REGEX = /bearer token-(.*)$/;

// This is an extremely simple token. In real applications make
// sure to use a better one, such as JWT (https://jwt.io/).
// see https://medium.freecodecamp.org/securing-node-js-restful-apis-with-json-web-tokens-9f811a92bb52

export function authenticate(){
  async ({headers: {authorization}}, Users) => {
    const email = authorization && HEADER_REGEX.exec(authorization)[1];
    return email && await Users.findOne({email});
    }
  }

export authentication{
  secret: process.env.secret
  database
}
