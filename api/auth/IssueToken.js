import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const token = jwt.sign(payload, process.env.SECRET),{
  expiresIn: "2h"
}
