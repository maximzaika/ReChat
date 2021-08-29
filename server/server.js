const { log } = require("./shared/logger");
const dateFormat = require("dateformat");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const socket = require("socket.io");
const cors = require("cors");

const {
  joinedUserHandler,
  joinedUsersHandler,
  getUserHandler,
  messageReceivedHandler,
  disconnectUserHandler,
} = require("./connectedUsers");
const actions = require("./socketIoActionTypes");
const { getFriendsHandlers } = require("./users");
const {
  getUserMessagesHandler,
  getNextMessageIdHandler,
  addMessageHandler,
  updateMessagesStatusHandler,
  updateMessageStatusHandler,
} = require("./messages");

const port = process.env.PORT || 8000;

app.use(express());
app.use(
  cors({
    origin:
      "http://localhost:3000" ||
      "http://127.0.0.1:3000" ||
      "192.168.0.157:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

let server = app.listen(port, () => {
  log(`[START] Listening on port: ${port}`, "green");
});

const io = socket(server);

app.post("/friendList", (req, res) => {
  log(`[post] /friendList requested by ${req.body.userId}`);
  const friends = getFriendsHandlers(req.body.userId);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(friends));
});

app.post("/messages", (req, res) => {
  log(`[post] /messages requested by ${req.body.userId}`);
  const messages = getUserMessagesHandler(req.body.userId, 0);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(messages[0]));

  for (let pendingSenders of messages[1]) {
    // logically senders become recipients because we need to notify them that
    // any pending message is received
    const recipientId = Object.keys(pendingSenders)[0];
    const messagesId = pendingSenders[recipientId];
    const senderId = messageReceivedHandler(req.body.userId, recipientId);

    if (senderId) {
      log(
        `[messageReceived /messages] ${senderId.recipientId} from ${senderId.userId}`
      );
      io.in(senderId.roomId).emit(actions.messageReceived, {
        messagesId: messagesId,
        userId: senderId.userId,
        recipientId: senderId.recipientId,
      });
    }
  }
});

io.on(actions.connection, (socket) => {
  socket.on(actions.joinRoom, ({ userId, recipientId, roomId }) => {
    // creates unique socket id of the connected user
    const userOnline = joinedUsersHandler(socket.id, roomId);
    const user = joinedUserHandler(socket.id, userId, recipientId, roomId);
    const date = new Date();

    if (user.new) {
      socket.join(user.data.roomId);
      log(
        `[connection (joinRoom)] ${userId} joined ${recipientId}. Room ${roomId}`
      );
    }

    if (userOnline) {
      log(`[connection (onlineStatus)] ${userId} notifies ${recipientId}`);
      io.in(userOnline.roomId).emit(actions.onlineStatus, {
        userId: userOnline.userId,
        socketId: userOnline.socketId,
        recipientId: userOnline.recipientId,
        lastOnline: dateFormat(date, "isoDateTime"),
        online: true,
      });
    }

    // If user has opened the chat, it would show their online status
    socket.broadcast.to(user.data.roomId).emit(actions.onlineStatus, {
      userId: user.data.userId,
      socketId: user.data.socketId,
      recipientId: user.data.recipientId,
      lastOnline: dateFormat(date, "isoDateTime"),
      online: true,
    });

    const messages = getUserMessagesHandler(userId, recipientId, 1);
    console.log("userId", userId);
    console.log("recipientId", recipientId);
    for (let pendingSenders of messages[1]) {
      // logically senders become recipients because we need to notify them that
      // the message has been received
      const recipientId = Object.keys(pendingSenders)[0];
      const messagesId = pendingSenders[recipientId];
      const senderId = messageReceivedHandler(userId, recipientId);

      if (senderId) {
        log(
          `[connection (joinRoom -> messageSeen)] ${senderId.recipientId} from ${senderId.userId}`
        );
        socket.broadcast.to(senderId.roomId).emit(actions.messageSeen, {
          messagesId: messagesId,
          userId: senderId.userId,
          recipientId: senderId.recipientId,
        });
      }
    }
  });

  socket.on(
    actions.sendMessage,
    ({ temporaryId, senderId, recipientId, timestamp, message }) => {
      const user = getUserHandler(socket.id);
      if (user) {
        const messageSent = addMessageHandler(
          senderId,
          recipientId,
          timestamp,
          message
        );
        log(`[sendMessage (message)] ${senderId} to ${recipientId}`);
        socket.broadcast.to(user.roomId).emit(actions.message, messageSent);
        log(`[sendMessage (messageSent)] ${senderId} to ${recipientId}`);
        socket.emit(actions.messageSent, {
          temporaryMessageId: temporaryId,
          newMessageId: messageSent.id,
          userId: senderId,
          recipientId: recipientId,
        });
      }
    }
  );

  socket.on(actions.messageStatus, ({ userId, recipientId }) => {
    const senderId = messageReceivedHandler(userId, recipientId);
    // socketId, userId, recipientId, RoomId

    if (senderId) {
      // 1 = received
      const messagesId = updateMessagesStatusHandler(recipientId, userId, 1);
      log(`[messageStatus (messageReceived)] ${recipientId} from ${userId}`);
      socket.broadcast.to(senderId.roomId).emit(actions.messageReceived, {
        messagesId: messagesId,
        userId: senderId.userId,
        recipientId: senderId.recipientId,
      });
    }
  });

  socket.on(actions.messageSeen, ({ messageId, userId, recipientId }) => {
    updateMessageStatusHandler(recipientId, userId, 1);
    updateMessageStatusHandler(recipientId, userId, 2);
    const user = messageReceivedHandler(recipientId, userId);

    if (user) {
      log(`[messageSeen] ${recipientId} from ${userId}`);
      socket.broadcast.to(user.roomId).emit(actions.messageSeen, {
        messagesId: [messageId],
        userId: userId,
        recipientId: recipientId,
      });
    }
  });

  socket.on(actions.disconnectRoom, () => {
    const user = disconnectUserHandler(socket.id);
    const date = new Date();

    if (user) {
      log(
        `[onlineStatus] (disconnectRoom) ${user.userId} closed chat ${user.recipientId}`
      );
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
      log(
        `[onlineStatus (disconnect)] ${user.userId} disconnected from ${user.recipientId}`
      );
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
