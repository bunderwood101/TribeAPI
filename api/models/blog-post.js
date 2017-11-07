import mongoose from 'mongoose';

var postSchema = new mongoose.Schema({
  _id:{
    type: String,
    required : true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  author: {
    type: String
  }
});

export default mongoose.model('posts', postSchema);
