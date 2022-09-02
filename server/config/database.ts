import mongoose, { ConnectOptions } from 'mongoose'

const URI = process.env.MONGODB_URL 

mongoose
  .connect(process.env.URLDBMONGO || `${URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  } as ConnectOptions)
  .then((db) => {
    console.log("Database Connected Successfuly.");
  })
  .catch((err) => {
    console.log("Error Connectiong to the Database");
  });