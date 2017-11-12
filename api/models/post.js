import mongoose from 'mongoose';

var postSchema = new mongoose.Schema({
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

export const modelPost = mongoose.model('Post', postSchema, 'Posts');
