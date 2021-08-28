const dateFormat = require("dateformat");

// messageStatus = 0 = sent
// messageStatus = 1 = received
// messageStatus = 2 = received + seen
const messages = [
  {
    id: 1,
    senderId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    recipientId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    timestamp: 1623753231285,
    message: "hrVDPmSIvlTK8d8JnYPd+IJz+g==",
    messageStatus: 2,
  },
  {
    id: 2,
    senderId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    recipientId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    timestamp: 1623753310611,
    message: "+SlVwVtxMssQNObatQ5kuggxnA==",
    messageStatus: 2,
  },
  {
    id: 3,
    senderId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    recipientId: "oymVbduXBQWWUeyPAeQDPYpzaih2",
    timestamp: 1623753310611,
    message:
      "SenderId: wAeLWFdtWgcFQF4tPvMeEcPp4nJ2, recipientId: oymVbduXBQWWUeyPAeQDPYpzaih2",
    messageStatus: 2,
  },
  {
    id: 4,
    senderId: "oymVbduXBQWWUeyPAeQDPYpzaih2",
    recipientId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    timestamp: 1623753310611,
    message:
      "SenderId: oymVbduXBQWWUeyPAeQDPYpzaih2, recipientId: wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    messageStatus: 2,
  },
  {
    id: 5,
    senderId: 1,
    recipientId: "394yzk6ckRcRXwrbF6UQGbdelb04",
    timestamp: 1623753310611,
    message: "SenderId: 394yzk6ckRcRXwrbF6UQGbdelb04, recipientId: 1",
    messageStatus: 2,
  },
  {
    id: 6,
    senderId: 2,
    recipientId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    timestamp: 1623753310611,
    message: "SenderId: 2, recipientId: D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    messageStatus: 2,
  },
  {
    id: 7,
    senderId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    recipientId: 2,
    timestamp: 1623753310611,
    message: "SenderId: D3M9bfjj9mSRfNR7gWKB2U7v4Ei1, recipientId: 2",
    messageStatus: 2,
  },
  {
    id: 8,
    senderId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    recipientId: 2,
    timestamp: 1623753310611,
    message: "#2 SenderId: D3M9bfjj9mSRfNR7gWKB2U7v4Ei1, recipientId: 2",
    messageStatus: 2,
  },
];

const checkPendingMessagesHandler = (userId, messageStatus) => {
  /* contains pending messages in the following format:
     [
        { userId : [messageId, messageId, messageId...] },
        { userId : [messageId, messageId, messageId...] },
     ]
  */
  const messageIds = [];
  for (let message of messages) {
    if (
      message.recipientId === userId &&
      message.messageStatus === messageStatus
    ) {
      message.messageStatus = messageStatus + 1;
      if (!messageIds.length) {
        messageIds.push({
          [message.senderId]: [message.id],
        });
      } else {
        let found = false;
        for (let messageId of messageIds) {
          if (message.senderId in messageId) {
            messageId[message.senderId].push(message.id);
            found = true;
            break;
          }
        }

        if (!found)
          messageIds.push({
            [message.senderId]: [message.id],
          });
      }
    }
  }
  return messageIds;
};

const getUserMessagesHandler = (userId, messageStatus) => {
  const messageIds = checkPendingMessagesHandler(userId, messageStatus);

  return [
    messages.filter(
      (message) => message.senderId === userId || message.recipientId === userId
    ),
    messageIds,
  ];
};

const getNextMessageIdHandler = () => {
  const currentId = messages[messages.length - 1].id;
  if (currentId) return currentId + 1;
  if (!currentId) return 0;
};

const addMessageHandler = (
  senderId,
  recipientId,
  timestamp,
  encryptedMessage
) => {
  const newMessageId = getNextMessageIdHandler();
  const message = {
    id: newMessageId,
    senderId: senderId,
    recipientId: recipientId,
    timestamp: dateFormat(timestamp, "isoDateTime"),
    message: encryptedMessage,
    messageStatus: 0,
  };
  messages.push(message);
  return message;
};

// status: 0 = sent, 1 = received, 2 = seen + received
const updateMessagesStatusHandler = (userId, recipientId, status) => {
  const messageIds = [];
  for (let message of messages) {
    if (
      message.senderId === userId &&
      message.recipientId === recipientId &&
      message.messageStatus === status - 1
    ) {
      message.messageStatus = status;
      messageIds.push(message.id);
    }
  }
  return messageIds;
};

// status: 0 = sent, 1 = received, 2 = seen + received
const updateMessageStatusHandler = (messageId, userId, recipientId, status) => {
  const messageIndex = messages.findIndex(
    (message) =>
      message.id === messageId &&
      message.senderId === userId &&
      message.recipientId === recipientId &&
      message.messageStatus === status - 1
  );
  messages[messageIndex] = status;
};

module.exports = {
  getUserMessagesHandler,
  getNextMessageIdHandler,
  addMessageHandler,
  updateMessagesStatusHandler,
  updateMessageStatusHandler,
};
