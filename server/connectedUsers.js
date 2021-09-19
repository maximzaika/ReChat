let connectedUsers = [];

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

/**
 * Add a new user to the array of connected users.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} userId Unique id of the connected user.
 * @param {string} recipientId Unique id of the recipient user (similar to userId).
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 * @return {[ConnectedUser, boolean]} newUser Data of a new connected user.
 */
const newConnectedUserHandler = (socketId, userId, recipientId, roomId) => {
  // checks whether user is connected, if he is then just return it
  const checkConnectedUser = connectedUsers.find(
    (user) =>
      user.socketId === socketId &&
      user.roomId === roomId &&
      user.userId === userId
  );
  if (checkConnectedUser) return [checkConnectedUser, false];

  // if user isn't connected then add him to the array of connected users
  const newUser = new ConnectedUser(socketId, userId, recipientId, roomId);
  connectedUsers.push(newUser);
  return [newUser, true];
};

/**
 * Checks for connected user in the same room.
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
 * Checks for connected users in the same room.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 * @param {string} senderId Unique id to identify the sender.
 * @return {ConnectedUser} Users connected.
 */
const findUniqueConnectedUserHandler = (socketId, senderId, roomId) =>
  connectedUsers.find(
    (user) =>
      user.socketId !== socketId &&
      user.userId !== senderId &&
      user.roomId === roomId
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

/**
 * Checks whether there are any other users connected to the room.
 * Excluding the receiver. If someone else is connected, then
 * receiver shouldn't be notified of the disconnection since another
 * socket is connected. Either way user is removed from the connected users.
 * @param {string} socketId Unique socket id to identify the user
 * @return {ConnectedUser | false} Disconnected user OR nobody disconnected.
 */
const disconnectUserHandler = (socketId) => {
  const index = connectedUsers.findIndex((user) => user.socketId === socketId);

  // if no user found, then just return false
  if (index === -1) return false;
  const { userId, roomId, recipientId } = connectedUsers[index];
  const similarSockets = connectedUsers.filter(
    (user) =>
      user.userId === userId &&
      user.recipientId === recipientId &&
      user.roomId === roomId
  );

  if (similarSockets.length === 1) {
    // remove disconnected user and let the server know who has disconnected
    return connectedUsers.splice(index, 1)[0];
  } else {
    // remove disconnected user
    connectedUsers.splice(index, 1);
    /* if there is another similar user is connected (maybe from another window)
    then notification of disconnection is not required */
    return false;
  }
};

module.exports = {
  newConnectedUserHandler,
  findConnectedUserHandler,
  findUniqueConnectedUserHandler,
  checkMessageReceivedHandler,
  disconnectUserHandler,
};
