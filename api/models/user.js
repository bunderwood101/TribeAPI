import mongoose from 'mongoose';

var userSchema = new mongoose.Schema({
  _id:{
    type: String,
    required : true
  },
  email: {
    type: String,
    required: true
  },
  firstname: {
    type: String
    required : true
  },
  surname: {
    type: String
    required : true
  },
  enabled: {
    type: Boolean
    required : true
  },
  locked: {
    type: Boolean
    required : true
  },
  password: {
    type: String
    required : true
  }
});

export default mongoose.model('User', userSchema);
