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

  console.log("newConnectedUserHandler", connectedUsers);

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
const findConnectedUserHandler = (socketId, roomId) => {
  console.log("findConnectedUserHandler", connectedUsers);
  return connectedUsers.find(
    (user) => user.socketId !== socketId && user.roomId === roomId
  );
};

/**
 * Checks for connected users in the same room.
 * @param {string} socketId Unique socket id to identify the user
 * @param {string} roomId Unique room id received from the client. Usually it is
 *                        a combination of user ids: id_id (but on the client
 *                        side it is encrypted)
 * @param {string} senderId Unique id to identify the sender.
 * @return {ConnectedUser} Users connected.
 */
const findUniqueConnectedUserHandler = (socketId, senderId, roomId) => {
  console.log("findUniqueConnectedUserHandler", connectedUsers);
  return connectedUsers.find(
    (user) =>
      user.socketId !== socketId &&
      user.userId !== senderId &&
      user.roomId === roomId
  );
};

/**
 * Checks whether message has been received by the receiver.
 * @param {string} receivedFromUserId Unique id of the sender.
 * @param {string} receivedByUserId Unique id of the receiver.
 * @return {ConnectedUser} User that received the message.
 */
const checkMessageReceivedHandler = (receivedFromUserId, receivedByUserId) => {
  console.log("checkMessageReceivedHandler", connectedUsers);

  return connectedUsers.find(
    (user) =>
      user.userId === receivedByUserId &&
      user.recipientId === receivedFromUserId
  );
};

const disconnectFromRoomHandler = (socketId, userId, recipientId) => {
  let disconnectedUser = {};
  const newConnectedUsers = [];
  const _connectedUsers = [...connectedUsers];
  const index = _connectedUsers.findIndex(
    (user) =>
      user.socketId === socketId &&
      user.userId === userId &&
      user.recipientId === recipientId
  );

  // if no user found, then just return false
  if (index === -1) return false;

  for (let connectedUser of _connectedUsers) {
    if (
      socketId === connectedUser.socketId &&
      connectedUser.userId === userId &&
      connectedUser.recipientId === recipientId
    )
      disconnectedUser = connectedUser;
    else {
      newConnectedUsers.push(connectedUser);
    }
  }

  /* Check if the same client has another window open
     if that's the case then client hasn't fully disconnected */
  const similarConnectedUsers = newConnectedUsers.filter(
    (user) => user.userId === userId && user.recipientId === recipientId
  );

  /* notify recipients that their friend has disconnected from the room */
  if (!similarConnectedUsers.length) return disconnectedUser;

  /* if there is another similar user is connected (maybe from another
     window) then disconnect from the server only and do not notify
     other connected clients */
  connectedUsers = newConnectedUsers;
  console.log("disconnectFromRoomHandler", connectedUsers);
  return false;
};

/**
 * Checks whether there are any other users connected to the room.
 * Excluding the receiver. If someone else is connected, then
 * receiver shouldn't be notified of the disconnection since another
 * socket is connected. Either way user is removed from the connected users.
 * @param {string} socketId Unique socket id to identify the user
 * @return {ConnectedUser[] | false} Disconnected user OR nobody disconnected.
 */
const disconnectUserHandler = (socketId) => {
  const disconnectedUsers = [];
  const _connectedUsers = [...connectedUsers];
  const newConnectedUsers = [];
  const index = _connectedUsers.findIndex((user) => user.socketId === socketId);

  // if no user found, then just return false
  if (index === -1) return false;

  /* now we know user's id and recipient's id which can be used
     to detect if the same client is connected from another window */
  const { userId, recipientId } = _connectedUsers[index];

  // move remaining connected users to one array, while disconnected to another
  for (let connectedUser of _connectedUsers) {
    if (socketId !== connectedUser.socketId)
      newConnectedUsers.push(connectedUser);
    if (socketId === connectedUser.socketId)
      disconnectedUsers.push(connectedUser);
  }

  /* Check if the same client has another window open
     if that's the case then client hasn't fully disconnected */
  const similarConnectedUsers = newConnectedUsers.filter(
    (user) => user.userId === userId && user.recipientId === recipientId
  );

  connectedUsers = newConnectedUsers;
  console.log("disconnectUserHandler", connectedUsers);

  /* notify recipients that their friend has disconnected */
  if (!similarConnectedUsers.length) return disconnectedUsers;

  /* if there is another similar user is connected (maybe from another
     window) then disconnect from the server only and do not notify
     other connected clients */
  return false;
};

module.exports = {
  newConnectedUserHandler,
  findConnectedUserHandler,
  findUniqueConnectedUserHandler,
  checkMessageReceivedHandler,
  disconnectFromRoomHandler,
  disconnectUserHandler,
};
