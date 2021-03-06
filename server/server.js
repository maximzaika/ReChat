const { log } = require("./shared/logger");
const dateFormat = require("dateformat");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const socket = require("socket.io");
const cors = require("cors");

const {
  newConnectedUserHandler,
  findConnectedUserHandler,
  findUniqueConnectedUserHandler,
  checkMessageReceivedHandler,
  disconnectFromRoomHandler,
  disconnectUserHandler,
} = require("./connectedUsers");
const actions = require("./socketIoActionTypes");
const {
  findFriendsHandler,
  updateUsersLastMessage,
  incrementUserMessageCounter,
  decrementUserMessageCounter,
  updateUsersOnlineStatus,
} = require("./users");
const {
  getUserMessagesHandler,
  findPendingMessagesHandler,
  storeMessageHandler,
  updateMessagesStatusHandler,
  updateMessageStatusHandler,
  deleteMessageHandler,
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
  log(`[post] /friendList requested by ${req.body.userId}`, "yellow");
  const friends = findFriendsHandler(req.body.userId).sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(friends));
});

app.post("/messages", (req, res) => {
  log(`[post] /messages requested by ${req.body.userId}`, "yellow");
  const messages = getUserMessagesHandler(req.body.userId);
  const pendingMessages = findPendingMessagesHandler(req.body.userId, 0);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(messages));

  // if there are no pending messages, then user doesn't need to be notified
  if (!pendingMessages.length) return;

  for (let pendingSenders of pendingMessages) {
    // logically senders become recipients because we need to notify them that
    // any pending message is received
    const recipientId = Object.keys(pendingSenders)[0];
    const messagesId = pendingSenders[recipientId];
    const senderId = checkMessageReceivedHandler(req.body.userId, recipientId);

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

/**
 * Used for keeping track of user's online status.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} userId Unique id of the connected user.
 * @param {string} recipientId Unique id of the recipient user (similar to userId).
 * @param {Date} timestamp Current time when user's status is updated.
 * @param {boolean} onlineStatus User's online status.
 */
function UserOnlineState(
  socketId,
  userId,
  recipientId,
  timestamp,
  onlineStatus
) {
  this.socketId = socketId;
  this.userId = userId;
  this.recipientId = recipientId;
  this.lastOnline = dateFormat(timestamp, "isoDateTime");
  this.online = onlineStatus;
}

/**
 * Used for keeping track of user's online status.
 * @param {String[]} messagesId Unique ids of the messages that are seen.
 * @param {string} userId Unique id of the connected user.
 * @param {string} recipientId Unique id of the recipient user (similar to userId).
 */
function MessageState(messagesId, userId, recipientId) {
  this.messagesId = messagesId;
  this.userId = userId;
  this.recipientId = recipientId;
}

io.on(actions.connection, (socket) => {
  socket.on(actions.joinRoom, ({ userId, recipientId, roomId }) => {
    // creates unique socket id of the connected user
    const [user, notConnected] = newConnectedUserHandler(
      socket.id,
      userId,
      recipientId,
      roomId
    );

    if (notConnected) {
      log(
        `[connection (joinRoom)] ${userId} joined ${recipientId}. Room ${roomId}`,
        "green"
      );
      socket.join(user.roomId);
    }
  });

  // If user has opened the chat, it would let everyone know about their online state
  socket.on(actions.onlineStatus, ({ roomId, userId, recipientId }) => {
    const date = new Date();
    log(
      `[onlineStatus] (connectRoom) ${userId} opened ${recipientId} chat`,
      "cyan"
    );
    const isUpdatedStatus = updateUsersOnlineStatus(
      userId,
      recipientId,
      date,
      false
    );
    if (!isUpdatedStatus) return;
    socket.broadcast
      .to(roomId)
      .emit(
        actions.onlineStatus,
        new UserOnlineState(socket.id, userId, recipientId, date, true)
      );

    // find all the messages that have status of 1 = received
    const pendingMessages = findPendingMessagesHandler(userId, 1);
    if (pendingMessages.length) {
      decrementUserMessageCounter(userId, recipientId, pendingMessages.length);

      for (let pendingSenders of pendingMessages) {
        // logically senders become recipients because we need to notify them that
        // the message has been received
        const recipientId = Object.keys(pendingSenders)[0];
        const messagesId = pendingSenders[recipientId];
        const senderId = checkMessageReceivedHandler(userId, recipientId);

        if (senderId) {
          log(
            `[onlineStatus (messageSeen)] ${senderId.recipientId} from ${senderId.userId}`
          );

          socket.broadcast
            .to(senderId.roomId)
            .emit(
              actions.messageSeen,
              new MessageState(
                messagesId,
                senderId.userId,
                senderId.recipientId
              )
            );
        }
      }
    }
  });

  socket.on(
    actions.sendMessage,
    ({ temporaryId, senderId, recipientId, roomId, timestamp, message }) => {
      // Temporary stores user's message to ensure that it is always delivered.
      const messageSent = storeMessageHandler(
        senderId,
        recipientId,
        timestamp,
        message
      );

      log(`[sendMessage (message)] ${senderId} to ${recipientId}`);

      // Update's friend's last message and the time of the last message.
      updateUsersLastMessage(senderId, recipientId, message);
      incrementUserMessageCounter(recipientId, senderId);

      // Sends a message to all the users in this room
      socket.broadcast.to(roomId).emit(actions.message, messageSent);

      log(`[sendMessage (messageSent)] ${senderId} to ${recipientId}`);

      /* Once the message is received by the server, server changes message's id
      then notifies the sender that the message is sent. Client then updates
      temporary message id with the new id of the message stored on the backend. */
      socket.emit(actions.messageSent, {
        temporaryMessageId: temporaryId,
        newMessageId: messageSent.id,
        userId: senderId,
        recipientId: recipientId,
      });
    }
  );

  /* If user's another friend window is open, and another friend has sent the message
  then need to notify the sender that the message is received */
  socket.on(actions.messageState, ({ userId, recipientId }) => {
    const senderId = checkMessageReceivedHandler(userId, recipientId);

    if (senderId) {
      // 1 = received
      const messagesId = updateMessagesStatusHandler(recipientId, userId, 1);
      log(`[messageState (messageReceived)] ${recipientId} from ${userId}`);
      socket.broadcast
        .to(senderId.roomId)
        .emit(
          actions.messageReceived,
          new MessageState(messagesId, senderId.userId, senderId.recipientId)
        );
    }
  });

  socket.on(actions.messageSeen, ({ messageId, userId, recipientId }) => {
    if (updateMessageStatusHandler(messageId, userId, recipientId, 1))
      updateMessageStatusHandler(messageId, userId, recipientId, 2);

    const user = checkMessageReceivedHandler(recipientId, userId);
    if (!user) return;
    log(`[messageSeen] ${recipientId} from ${userId}`);
    socket.broadcast
      .to(user.roomId)
      .emit(
        actions.messageSeen,
        new MessageState([messageId], userId, recipientId)
      );
  });

  socket.on(
    actions.messageDelete,
    ({ messageId, roomId, senderId, recipientId }) => {
      /* let every user in the same room know that the message with
         messageId needs to be removed - including sender. */
      const newMessage = "This message was deleted.";
      const isDeleted = deleteMessageHandler(messageId, newMessage, senderId);

      if (!isDeleted) {
        // if message isn't removed, then let the sender know
        log(`[messageDelete] ${messageId} not removed in ${roomId}`);
        socket.emit(actions.messageDelete, {
          isDeleted,
        });
      } else {
        /* if message is removed, then let other users in the same room know
           that sender's message needs to be removed */
        log(`[messageDelete] ${messageId} removed in ${roomId}`);
        socket.broadcast.to(roomId).emit(actions.messageDelete, {
          isDeleted,
          messageId,
          message: newMessage,
          friendId: senderId,
        });

        /* if message is removed, then let sender know that recipient's message
           needs to be removed */
        socket.emit(actions.messageDelete, {
          isDeleted,
          messageId,
          message: newMessage,
          friendId: recipientId,
        });
      }
    }
  );

  // boolean
  socket.on(actions.typingState, ({ isTyping, senderId, roomId }) => {
    const user = findUniqueConnectedUserHandler(socket.id, senderId, roomId);
    if (!user) return;

    log(`[typingStatus] ${user.recipientId} typing to ${user.userId}`);
    socket.broadcast.to(user.roomId).emit(actions.typingState, {
      userId: user.recipientId,
      recipientId: user.userId,
      typingState: isTyping,
    });
  });

  socket.on(actions.disconnectRoom, ({ senderId, recipientId }) => {
    const date = new Date();
    const disconnectedUser = disconnectFromRoomHandler(
      socket.id,
      senderId,
      recipientId
    );
    if (!disconnectedUser) return;
    log(
      `[onlineStatus] (disconnectRoom) ${disconnectedUser.userId} closed ${disconnectedUser.recipientId}'s chat`,
      "yellow"
    );
    const isUpdatedStatus = updateUsersOnlineStatus(
      disconnectedUser.userId,
      disconnectedUser.recipientId,
      date,
      false
    );
    if (!isUpdatedStatus) return;
    io.to(disconnectedUser.roomId).emit(
      actions.onlineStatus,
      new UserOnlineState(
        disconnectedUser.socketId,
        disconnectedUser.userId,
        disconnectedUser.recipientId,
        date,
        false
      )
    );
  });

  socket.on(actions.disconnect, () => {
    const date = new Date();
    const disconnectedUsers = disconnectUserHandler(socket.id);
    if (!disconnectedUsers) return;

    for (let disconnectedUser of disconnectedUsers) {
      log(
        `[onlineStatus] (disconnect) ${disconnectedUser.userId} disconnected from ${disconnectedUser.recipientId}`,
        "red"
      );
      const isUpdatedStatus = updateUsersOnlineStatus(
        disconnectedUser.userId,
        disconnectedUser.recipientId,
        date,
        false
      );
      if (!isUpdatedStatus) return;
      io.to(disconnectedUser.roomId).emit(
        actions.onlineStatus,
        new UserOnlineState(
          disconnectedUser.socketId,
          disconnectedUser.userId,
          disconnectedUser.recipientId,
          date,
          false
        )
      );
    }
  });
});
