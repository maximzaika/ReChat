const connectedUsers = [];

// called when user decides to join the chatroom
const joinedUsersHandler = (senderId, recipientId, roomId) => {
  const user = { senderId, recipientId, roomId };
  const isConnected = connectedUsers.find(
    (user) =>
      user.senderId === senderId &&
      user.recipientId === recipientId &&
      user.roomId === roomId
  );

  // previously joined user to prevent sending them to connectedUsers
  if (isConnected) return { new: false, data: user };

  connectedUsers.push(user);
  return { new: true, data: user };
};

console.log("user out", connectedUsers);

// received user's id to return the current user
const getUserHandler = (senderId, recipientId) => {
  return connectedUsers.find(
    (user) => user.senderId === senderId && user.recipientId === recipientId
  );
};

const disconnectRoomHandler = (senderId, recipientId) => {
  return connectedUsers.find(
    (user) => user.senderId === senderId && user.recipientId === recipientId
  );
};

// called when the user leaves the chat and its object gets deleted from the array
const disconnectUserHandler = (disconnectedUser) => {
  // const disconnected = [];
  // for (let i = 0; i < connectedUsers.length; i++) {
  //   console.log(connectedUsers[i].senderId);
  //   if (connectedUsers[i].senderId === disconnectedUser) {
  //     disconnected.push(connectedUsers[i]);
  //   }
  // }
  // return disconnected;

  const index = connectedUsers.findIndex(
    (user) => user.senderId === disconnectedUser
  );
  if (index !== -1) return connectedUsers.splice(index, 1)[0];
};

module.exports = {
  joinedUsersHandler,
  getUserHandler,
  disconnectRoomHandler,
  disconnectUserHandler,
};
