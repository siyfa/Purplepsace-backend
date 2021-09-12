import { Server } from "socket.io";
const socketPort = process.env.SOCKET_PORT || 8900;

//socket.io
export default function socket() {
  const io = new Server(socketPort, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

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
}
