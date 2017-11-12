import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  firstname: {
    type: String,
    required : true
  },
  surname: {
    type: String,
    required : true
  },
  enabled: {
    type: Boolean,
    required : true
  },
  locked: {
    type: Boolean,
    required : true
  },
  password: {
    type: String,
    select: false,
    required : true,
    bcrypt : true
  }
})


userSchema.pre('save', function(next) {
  var user = this
  // TODO Error handling
  bcrypt.genSalt(parseInt(process.env.SALTROUNDS), function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash
      next()
      });
    });
})

export var modelUser = mongoose.model('User', userSchema, 'users');
