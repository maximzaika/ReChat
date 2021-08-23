const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const {
  joinedUsersHandler,
  getUserHandler,
  disconnectRoomHandler,
  disconnectUserHandler,
} = require("./dummyuser");
const actions = require("./socketIoActionTypes");

app.use(express());

const port = 8000;

app.use(cors());

let server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server);

io.on(actions.connection, (socket) => {
  socket.on(actions.joinRoom, ({ recipientId, roomId }) => {
    // creates unique socket id of the connected user
    const user = joinedUsersHandler(socket.id, recipientId, roomId);

    if (user.new) {
      socket.join(user.data.roomId);
      socket.emit(actions.message, {
        senderId: user.data.senderId,
        recipientId: user.data.recipientId,
        message: `Welcome ${user.data.senderId}`,
      });
    }

    console.log("connected user > ", user);

    // If user has opened the chat, it would show their online status
    socket.broadcast.to(user.data.roomId).emit(actions.onlineStatus, {
      senderId: user.data.senderId,
      recipientId: user.data.recipientId,
      online: true,
    });
  });

  socket.on(actions.sendMessage, ({ recipientId, message }) => {
    const user = getUserHandler(socket.id, recipientId);

    io.to(user.roomId).emit(actions.message, {
      senderId: user.senderId,
      recipientId: user.recipientId,
      message: message,
    });
  });

  socket.on(actions.disconnectRoom, (recipientId) => {
    const user = disconnectRoomHandler(socket.id, recipientId);

    if (user) {
      console.log("closed chat >", user);
      io.to(user.roomId).emit(actions.onlineStatus, {
        senderId: user.senderId,
        recipientId: user.recipientId,
        online: false,
      });
    }
  });

  socket.on(actions.disconnect, () => {
    const user = disconnectUserHandler(socket.id);

    console.log("disconnect", user);
    if (user) {
      io.to(user.roomId).emit(actions.onlineStatus, {
        senderId: user.senderId,
        recipientId: user.recipientId,
        online: false,
      });
    }
  });
});
