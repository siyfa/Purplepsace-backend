import mongoose from "mongoose";
import dotenv from "dotenv";

//env
dotenv.config();

//MongoDb
export default function MongoDb() {
  mongoose
    .connect(process.env.DB_URl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => console.log("MongoDb is connnected to the server..."))
    .catch((err) => console.log(err));
}
