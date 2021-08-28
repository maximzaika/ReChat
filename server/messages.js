const dateFormat = require("dateformat");

// messageStatus = 1 = received
// messageStatus = 2 = received + seen
const messages = [
  {
    id: 1,
    senderId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    recipientId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    timestamp: 1623753231285,
    message:
      "SenderId: D3M9bfjj9mSRfNR7gWKB2U7v4Ei1, recipientId: wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    messageStatus: 2,
  },
  {
    id: 2,
    senderId: "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    recipientId: "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    timestamp: 1623753310611,
    message:
      "SenderId: wAeLWFdtWgcFQF4tPvMeEcPp4nJ2, recipientId: D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
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
    received: 2,
  },
];

const getUserMessagesHandler = (userId) => {
  return messages.filter(
    (message) => message.senderId === userId || message.recipientId === userId
  );
};

const getNextMessageIdHandler = () => {
  const currentId = messages[messages.length - 1].id;
  if (currentId) return currentId + 1;
  if (!currentId) return 0;
};

const addMessageHandler = (senderId, recipientId, encryptedMessage) => {
  const index = getNextMessageIdHandler();
  const message = {
    id: index,
    senderId: senderId,
    recipientId: recipientId,
    timestamp: dateFormat(new Date(), "isoDateTime"),
    message: encryptedMessage,
    messageStatus: 1,
  };
  messages.push(message);
  return message;
};

const updateMessageStatusHandler = (userId, recipientId) => {
  const index = messages.findIndex(
    (message) =>
      message.senderId === userId && message.recipientId === recipientId
  );
  messages[index].messageStatus = 2;
  return messages[index].id;
};

module.exports = {
  getUserMessagesHandler,
  getNextMessageIdHandler,
  addMessageHandler,
  updateMessageStatusHandler,
};
