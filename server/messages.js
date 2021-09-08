const dateFormat = require("dateformat");
const { v4: uuid } = require("uuid");

// messageStatus = 0 = sent
// messageStatus = 1 = received
// messageStatus = 2 = received + seen
function Message(
  id,
  senderId,
  recipientId,
  timestamp,
  encryptedMessage,
  messageStatus
) {
  this.id = id;
  this.senderId = senderId;
  this.recipientId = recipientId;
  this.timestamp = dateFormat(timestamp, "isoDateTime");
  this.message = encryptedMessage;
  this.messageStatus = messageStatus;
}

const messages = [
  new Message(
    1,
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    1623753231285,
    "hrVDPmSIvlTK8d8JnYPd+IJz+g==",
    2
  ),
  new Message(
    2,
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    3,
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    4,
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    5,
    1,
    "394yzk6ckRcRXwrbF6UQGbdelb04",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    6,
    2,
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    7,
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    2,
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    8,
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    2,
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
];

/**
 * Searches for any pending messages.
 * @param {string} userId Unique id of the connected user.
 * @param {number} messageStatus Status of the message: 0 = sent, 1 = received, 2 = seen
 * @return {Array.<Object.<string, string[]>>} Users connected.
 */
const findPendingMessagesHandler = (userId, messageStatus) => {
  /**
   * Contains messages in the following format:
   *  [
   *    { userId : [messageId, messageId, messageId...] },
   *    { userId : [messageId, messageId, messageId...] }, ...
   *  ]
   * @type {Array.<Object.<string, string[]>>}
   * */
  const messageIds = [];
  const _messages = [...messages];
  for (let message of _messages) {
    // match user with their incoming messages
    if (
      message.recipientId === userId &&
      message.messageStatus === messageStatus
    ) {
      // update messageStatus to the next status
      message.messageStatus = messageStatus + 1;

      const messageId = {
        [message.senderId]: [message.id],
      };

      // if there are no users (from those we received a messages) in the array, then add
      // user as an object and their message
      if (messageIds.length) {
        messageIds.push({
          [message.senderId]: [message.id],
        });
      } else {
        // if user already exists (and has messages), then we need to add another message
        let found = false;
        for (let messageId of messageIds) {
          if (message.senderId in messageId) {
            messageId[message.senderId].push(message.id);
            found = true;
            break;
          }
        }

        // if message is successfully added, then go for the next iteration,
        // otherwise add user and a message to the array (just for safety purposes)
        if (found) continue;
        messageIds.push(messageId);
      }
    }
  }

  return messageIds;
};

const getUserMessagesHandler = (userId) => {
  const _messages = {};
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].senderId === userId || messages[i].recipientId === userId) {
      if (messages[i].senderId === userId) {
        if (messages[i].recipientId in _messages) {
          _messages[messages[i].recipientId].push(messages[i]);
        } else {
          _messages[messages[i].recipientId] = [messages[i]];
        }
      } else {
        if (messages[i].senderId in _messages) {
          _messages[messages[i].senderId].push(messages[i]);
        } else {
          _messages[messages[i].senderId] = [messages[i]];
        }
      }
    }
  }

  return _messages;
};

const getNextMessageIdHandler = () => {
  const currentId = messages[messages.length - 1].id;
  if (currentId) return currentId + 1;
  if (!currentId) return 0;
};

/**
 * Temporary stores the message on the server side.
 * @example If message is not delivered to another client, then it needs to be stored temporary.
 * @param {string} senderId Unique id of the sender.
 * @param {string} recipientId Unique id of the recipient.
 * @param {Date} timestamp Timestamp of the message.
 * @param {string} encryptedMessage User's message in the encrypted format.
 * @return {Message} User's message containing it's metadata.
 */
const storeMessageHandler = (
  senderId,
  recipientId,
  timestamp,
  encryptedMessage
) => {
  const message = new Message(
    uuid(),
    senderId,
    recipientId,
    timestamp,
    encryptedMessage,
    0
  );
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
  findPendingMessagesHandler,
  storeMessageHandler,
  updateMessagesStatusHandler,
  updateMessageStatusHandler,
};
