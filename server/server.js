process.env.TZ = "Europe/Amsterdam";
const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const {
  joinedUserHandler,
  joinedUsersHandler,
  getUserHandler,
  disconnectUserHandler,
} = require("./dummyuser");
const actions = require("./socketIoActionTypes");
const dateFormat = require("dateformat");

app.use(express());

const port = 8000;

app.use(cors());

let server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server);

io.on(actions.connection, (socket) => {
  socket.on(actions.joinRoom, ({ userId, recipientId, roomId }) => {
    // creates unique socket id of the connected user
    const userOnline = joinedUsersHandler(socket.id, roomId);
    const user = joinedUserHandler(socket.id, userId, recipientId, roomId);
    const date = new Date();

    console.log("user online> ", userOnline);

    if (user.new) {
      socket.join(user.data.roomId);
    }

    if (userOnline) {
      socket.emit(actions.onlineStatus, {
        userId: userOnline.userId,
        socketId: userOnline.socketId,
        recipientId: userOnline.recipientId,
        lastOnline: dateFormat(date, "isoDateTime"),
        online: true,
      });
    }

    console.log("connected user > ", user);

    // If user has opened the chat, it would show their online status
    socket.broadcast.to(user.data.roomId).emit(actions.onlineStatus, {
      userId: user.data.userId,
      socketId: user.data.socketId,
      recipientId: user.data.recipientId,
      lastOnline: dateFormat(date, "isoDateTime"),
      online: true,
    });
  });

  socket.on(
    actions.sendMessage,
    ({ senderId, recipientId, timestamp, message }) => {
      const user = getUserHandler(socket.id, recipientId);

      if (user) {
        io.to(user.roomId).emit(actions.message, {
          senderId: senderId,
          recipientId: user.recipientId,
          timestamp: timestamp,
          message: message,
        });
      }
    }
  );

  socket.on(actions.disconnectRoom, () => {
    const user = disconnectUserHandler(socket.id);
    const date = new Date();

    if (user) {
      io.to(user.roomId).emit(actions.onlineStatus, {
        userId: user.userId,
        socketId: user.socketId,
        recipientId: user.recipientId,
        lastOnline: dateFormat(date, "isoDateTime"),
        online: false,
      });
    }
  });

  socket.on(actions.disconnect, () => {
    const user = disconnectUserHandler(socket.id);
    const date = new Date();

    if (user) {
      io.to(user.roomId).emit(actions.onlineStatus, {
        userId: user.userId,
        socketId: user.socketId,
        recipientId: user.recipientId,
        lastOnline: dateFormat(date, "isoDateTime"),
        online: false,
      });
    }
  });
});
