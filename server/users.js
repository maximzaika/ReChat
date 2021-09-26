const User = require("./user");
const dateFormat = require("dateformat");

let users = [
  new User(
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1_wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    null,
    "Valeriy",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-27T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-27T13:10:20+0800",
    2
  ),
  new User(
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1_wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    null,
    "Maxim",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-26T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-26T13:10:20+0800",
    3
  ),
  new User(
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "oymVbduXBQWWUeyPAeQDPYpzaih2_D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    null,
    "Test",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-25T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-25T13:10:20+0800",
    0
  ),
  new User(
    "D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2_D3M9bfjj9mSRfNR7gWKB2U7v4Ei1",
    null,
    "Maxim",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-25T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-25T13:10:20+0800",
    0
  ),
  new User(
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2_wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    null,
    "Test",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-25T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-25T13:10:20+0800",
    0
  ),
  new User(
    "wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2",
    "oymVbduXBQWWUeyPAeQDPYpzaih2_wAeLWFdtWgcFQF4tPvMeEcPp4nJ2",
    null,
    "Valeriy",
    "47Y/91XQkM+NLj/jIlvreV9fKg==",
    "2021-08-24T13:10:20+0800",
    false,
    false,
    0,
    "2021-08-24T13:10:20+0800",
    1
  ),
];

/**
 * Searches for all the user's friends.
 * @param {string} userId Unique id of the connected user.
 * @return {User[]} User's friends.
 */
const findFriendsHandler = (userId) =>
  users.filter((user) => user.userId === userId);

/**
 * Searches for all the user's friends.
 * @param {string} senderId Unique id of the sender.
 * @param {string} recipientId Unique id of the recipient.
 * @param {string} encryptedMessage Sender's message in the encrypted format.
 */
const updateUsersLastMessage = (senderId, recipientId, encryptedMessage) => {
  const _users = [...users];
  users = _users.map((user) => {
    if (
      (user.id === senderId && user.userId === recipientId) ||
      (user.id === recipientId && user.userId === senderId)
    ) {
      user.lastMessage = encryptedMessage;
      user.time = dateFormat(new Date(), "isoDateTime");
    }
    return user;
  });
};

/**
 * Increments user's messages on receive.
 * @param {string} recipientId Recipient's ID.
 * @param {string} senderId Sender's ID.
 * @return {boolean} true = PASS, false = FAIL
 */
const incrementUserMessageCounter = (recipientId, senderId) => {
  const _users = [...users];
  const index = _users.findIndex(
    (user) => user.userId === recipientId && user.id === senderId
  );
  if (!index) return false;
  _users[index].unreadMessages++;
  users = _users;
  return true;
};

/**
 * Reduces user's messages when seen.
 * @param {string} senderId Sender's unique ID.
 * @param {string} recipientId Recipient's unique ID.
 * @param {number} qty Number of messages seen.
 * @return {boolean} true = PASS, false = FAIL
 */
const decrementUserMessageCounter = (senderId, recipientId, qty) => {
  const _users = [...users];
  const index = _users.findIndex(
    (user) => user.userId === senderId && user.id === recipientId
  );
  if (!index && _users[index].unreadMessages === 0) return false;
  console.log(qty);
  _users[index].unreadMessages -= qty;
  users = _users;
  return true;
};

/**
 * Reduces user's messages when seen.
 * @param {string} friendId Id of the friend that requires status update.
 * @param {string} userId Id of the friend of a friend.
 * @param {Date} date Timestamp.
 * @param {boolean} onlineStatus true = User is online, false = User is offline.
 * @return {boolean} true = user is found & updated, false = user is not found & !updated
 */
const updateUsersOnlineStatus = (friendId, userId, date, onlineStatus) => {
  const _users = [...users];
  const index = _users.findIndex(
    (user) => user.id === friendId && user.userId === userId
  );

  // if user doesn't exist then do not proceed
  if (index === -1) return false;

  // if user's online status is False then this is the time of last seen
  if (!onlineStatus) _users[index].lastOnline = date;
  _users[index].onlineState = onlineStatus;
  users = _users;

  return true;
};

module.exports = {
  findFriendsHandler,
  updateUsersLastMessage,
  incrementUserMessageCounter,
  decrementUserMessageCounter,
  updateUsersOnlineStatus,
};
