const dateFormat = require("dateformat");
const { v4: uuid } = require("uuid");

let messages = [
  new Message(
    "1",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    1623753231285,
    "hrVDPmSIvlTK8d8JnYPd+IJz+g==",
    2
  ),
  new Message(
    "2",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "3",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "4",
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "5",
    1,
    "394yzk6ckRcRXwrbF6UQGbdelb04",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "6",
    2,
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "7",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    2,
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
  new Message(
    "8",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    2,
    1623753310611,
    "+SlVwVtxMssQNObatQ5kuggxnA==",
    2
  ),
];

/**
 * Used for creating/accessing a Message
 * @param {string} id Unique message id
 * @param {string} senderId Unique id of the sender.
 * @param {string} recipientId Unique id of the recipient user (similar to senderId).
 * @param {Date | number} timestamp Date & Time when the message was sent.
 * @param {string} encryptedMessage User's message in the encrypted format
 * @param {number} messageStatus 0 = sent, 1 = received, 2 = receive + seen, 3 = deleted
 */
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

/**
 * Retrieves user's friend's message on HTTP request (on connecting).
 * @param {string} userId Unique id of the connected user.
 * @return {Object.<string, Message[]>} Users connected.
 */
const getUserMessagesHandler = (userId) => {
  /**
   * Contains messages of user's friends:
   *  {
   *    friendId : [Message{}, Message{}, Message{}...],
   *    friendId : [Message{}, Message{}, Message{}...], ...
   *  }
   * @type {Object.<string, Message[]>}
   * */
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

/**
 * Update's message status based on the previous status. 0 to 1, 1 to 2
 * @param {string} messageId Message's unique id.
 * @param {string} userId Sender's unique id.
 * @param {string} recipientId Recipient's unique id.
 * @param {0 | 1 | 2} status 0 = sent, 1 = received, 2 = seen + received
 * @return {boolean} Indicates successfully update.
 */
const updateMessageStatusHandler = (messageId, userId, recipientId, status) => {
  const _messages = [...messages];
  const messageIndex = _messages.findIndex(
    (message) =>
      message.id === messageId &&
      message.senderId === userId &&
      message.recipientId === recipientId &&
      message.messageStatus === status - 1
  );
  _messages[messageIndex] = status;
  messages = _messages;
  return true;
};

/**
 * Update's all messages status based on the previous status. 0 to 1, 1 to 2
 * @param {string} userId Sender's unique id.
 * @param {string} recipientId Recipient's unique id.
 * @param {0 | 1 | 2} status 0 = sent, 1 = received, 2 = seen + received
 * @return {string[]} Indicates successfully update.
 */
const updateMessagesStatusHandler = (userId, recipientId, status) => {
  const messageIds = [];
  const _messages = [...messages];
  for (let message of _messages) {
    if (
      message.senderId === userId &&
      message.recipientId === recipientId &&
      message.messageStatus === status - 1
    ) {
      message.messageStatus = status;
      messageIds.push(message.id);
    }
  }
  messages = _messages;
  return messageIds;
};

// check whether sender is authentic, change message to "deleted",
// change message status to 3 = deleted
const deleteMessageHandler = (messageId, newMessage, senderId) => {
  const _messages = [...messages];
  /* check whether message exists and whether the sender is the person who sent this
     message before. Receivers are not allowed to delete sender's messages. */
  const index = _messages.findIndex(
    (message) => message.id === messageId && message.senderId === senderId
  );
  if (index === -1) return false;
  // if message is already deleted then there is some error
  if (_messages[index].messageStatus === 3) return false;

  const timestamp = new Date(_messages[index].timestamp);
  const allowedDeletion =
    (new Date().getTime() - timestamp.getTime()) / 3600000;

  // if message is past 1 hour time frame then it cannot be deleted
  if (allowedDeletion > 1) return false;

  _messages[index].message = newMessage;
  _messages[index].messageStatus = 3;
  messages = _messages;
  return true;
};

module.exports = {
  getUserMessagesHandler,
  findPendingMessagesHandler,
  storeMessageHandler,
  deleteMessageHandler,
  updateMessagesStatusHandler,
  updateMessageStatusHandler,
};
