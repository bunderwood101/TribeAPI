import jwt from 'jsonwebtoken'


jwt.verify(payload, process.env.SECRET,function(err, decoded) {
  if(err){
    if(err.expiredAt){
      return error(err.name, err.message, err.expiredAt)
    } else {
    return error(err.name, err.message)
    }
  }
});
