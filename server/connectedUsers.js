const connectedUsers = [];

// called when user decides to join the chatroom
const joinedUserHandler = (socketId, userId, recipientId, roomId) => {
  const user = { socketId, userId, recipientId, roomId };
  const isConnected = connectedUsers.find(
    (user) =>
      user.socketId === socketId &&
      user.userId === userId &&
      user.recipientId === recipientId &&
      user.roomId === roomId
  );

  // previously joined user to prevent sending them to connectedUsers
  if (isConnected) return { new: false, data: user };

  connectedUsers.push(user);
  return { new: true, data: user };
};

const joinedUsersHandler = (socketId, roomId) => {
  return connectedUsers.find(
    (user) => user.socketId !== socketId && user.roomId === roomId
  );
};

// received user's id to return the current user
const getUserHandler = (socketId) => {
  return connectedUsers.find((user) => user.socketId === socketId);
};

const messageReceivedHandler = (receivedFromUserId, receivedByUserId) => {
  return connectedUsers.find(
    (user) =>
      user.userId === receivedByUserId &&
      user.recipientId === receivedFromUserId
  );
};

// called when the user leaves the chat and its object gets deleted from the array
const disconnectUserHandler = (disconnectedUser) => {
  const index = connectedUsers.findIndex(
    (user) => user.socketId === disconnectedUser
  );
  if (index !== -1) return connectedUsers.splice(index, 1)[0];
};

module.exports = {
  joinedUserHandler,
  joinedUsersHandler,
  getUserHandler,
  messageReceivedHandler,
  disconnectUserHandler,
};
