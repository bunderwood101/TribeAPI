import mongoose from 'mongoose'

//Set up default mongoose connection
var mongoDB = process.env.MONGO_DB

mongoose.connect(mongoDB, {
  useMongoClient: true,
  promiseLibrary: global.Promise
});

//Bind connection to error event (to get notification of connection errors)
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// https://stackoverflow.com/questions/23293202/export-and-reuse-my-mongoose-connection-across-multiple-models
