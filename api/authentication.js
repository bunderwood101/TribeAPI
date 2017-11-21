import bcrypt from 'bcryptjs'

let saltRounds = parseInt(process.env.SALTROUNDS) || 10

const HEADER_REGEX = /bearer token-(.*)$/;

// see https://medium.com/react-native-training/building-chatty-part-7-authentication-in-graphql-cd37770e5ab3
// add versioning to JWT based on Doc version set by mongoose to protect forgot password etc.

export function authenticate(){
  async ({headers: {authorization}}, Users) => {
    const email = authorization && HEADER_REGEX.exec(authorization)[1];
    return email && await Users.findOne({email});
    }
  }

// TODO add error handling for function
export default{
  hashPassword (plaintextPassword) {
    return new Promise((resolve,reject) =>
      bcrypt.hash(plaintextPassword, saltRounds).then(function (err,hash) {
        if( err ){
          return reject(err)
        }
        else {
          return resolve(hash)
          }
        })
    )
  },
  comparePassword (plaintextPassword, hash){
    console.log(plaintextPassword, hash)
    bcrypt.compare(plaintextPassword, hash).then(function(res) {
      return(res)
    });
  }
}
