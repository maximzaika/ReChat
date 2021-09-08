/**
 * Used for creating/accessing Connected Users
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} userId Unique id of the connected user.
 * @param {string} recipientId Unique id of the recipient user (similar to userId).
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 */
function ConnectedUser(socketId, userId, recipientId, roomId) {
  this.socketId = socketId;
  this.userId = userId;
  this.recipientId = recipientId;
  this.roomId = roomId;
}

// Contains all the connected users
const connectedUsers = [];

/**
 * Add a new user to the array of connected users.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} userId Unique id of the connected user.
 * @param {string} recipientId Unique id of the recipient user (similar to userId).
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 * @return {ConnectedUser} newUser Data of a new connected user.
 */
const newConnectedUserHandler = (socketId, userId, recipientId, roomId) => {
  const newUser = new ConnectedUser(socketId, userId, recipientId, roomId);
  connectedUsers.push(newUser);
  return newUser;
};

/**
 * Checks for connected users in the same room.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 * @return {ConnectedUser} Users connected.
 */
const findConnectedUserHandler = (socketId, roomId) =>
  connectedUsers.find(
    (user) => user.socketId !== socketId && user.roomId === roomId
  );

/**
 * Checks whether message has been received by the receiver.
 * @param {string} receivedFromUserId Unique id of the sender.
 * @param {string} receivedByUserId Unique id of the receiver.
 * @return {ConnectedUser} User that received the message.
 */
const checkMessageReceivedHandler = (receivedFromUserId, receivedByUserId) =>
  connectedUsers.find(
    (user) =>
      user.userId === receivedByUserId &&
      user.recipientId === receivedFromUserId
  );

// called when the user leaves the chat and its object gets deleted from the array
const disconnectUserHandler = (disconnectedUser) => {
  const index = connectedUsers.findIndex(
    (user) => user.socketId === disconnectedUser
  );
  if (index !== -1) return connectedUsers.splice(index, 1)[0];
};

module.exports = {
  newConnectedUserHandler,
  findConnectedUserHandler,
  checkMessageReceivedHandler,
  disconnectUserHandler,
};
