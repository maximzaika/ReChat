const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const {
  disconnectUserHandler,
  getUserHandler,
  joinedUsersHandler,
} = require("./dummyuser");

app.use(express());

const port = 8000;

app.use(cors());

let server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server);

// init the socket io connection
io.on("connection", (socket) => {
  // new user joins
  // socket.on("joinRoom", ({ username, roomname }) => {
  socket.on("joinRoom", ({ username }) => {
    // onJoinCreateUser
    // const user = joinedUsersHandler(socket.id, username, roomname);
    const user = joinedUsersHandler(socket.id, username);

    // if this is a new user
    if (user.type === 1) {
      socket.join(user.room);

      // onJoinShowWelcomeMessage
      socket.emit("message", {
        userId: user.data.id,
        username: user.data.username,
        text: `Welcome ${user.data.username}`,
      });
    }

    // onJoinNotifyOtherUsers
    socket.broadcast.to(user.room).emit("message", {
      userId: user.data.id,
      username: user.data.username,
      text: `${user.data.username} has joined the chat`,
    });
  });

  // onUserSendMessage
  socket.on("chat", (text) => {
    const user = getUserHandler(socket.id);

    io.to(user.room).emit("message", {
      userId: user.id,
      username: user.username,
      text: text,
    });
  });

  // onUserDisconnect
  const user = disconnectUserHandler(socket.id);
  if (user) {
    io.to(user.room).emit("message", {
      userId: user.id,
      username: user.username,
      text: `${user.username} has left the room`,
    });
  }
});
