//dependencies
import express from "express";
import http, { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//
import MongoDb from "./config/MongoDb.js";
import socket from "./config/socket.js";
import cloudinary from "./config/cloudinary.js";
import upload from "./config/multer.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";

const app = express();
const server = http.createServer(app);
// const io = Server.listen(server);
const port = process.env.PORT || 5000;

//env
dotenv.config();

//Db
MongoDb();

//socket.io
// socket();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });
//multer
// const storage = multer.memoryStorage();
// const multerUploads = multer({ storage }).single("file");

// const upload = multer({ storage });

app.use("/api/upload", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    console.log(req.file);
    const result = await cloudinary.uploader.upload(req.file.path);
    return res.status(200).json("File uploaded succesfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }
//routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
// app.use("/", (req, res) => {
//   res.send("Welcome to Purplespace endppoint");
// });
app.use("*", (req, res) => {
  res.send("404 Page Cannot Be Found");
});

//socket

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user is connected");
  //when connect
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });
  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });
  //when disconnect
  socket.on("disconnect", () => {
    console.log("A user is disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

//server listen
server.listen(port, () => {
  console.log(`Purple server running on port ${port}...`);
});
