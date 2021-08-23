const connectedUsers = [];

// called when user decides to join the chatroom
const joinedUsersHandler = (id, username, room) => {
  const user = { id, username, room };
  if (connectedUsers.find((user) => user.id === id && user.room === room)) {
    console.log("existing user > ", user);
    return { new: false, data: user };
  }
  console.log("new user > ", user);
  connectedUsers.push(user);
  return { new: true, data: user };
};

console.log("user out", connectedUsers);

// received user's id to return the current user
const getUserHandler = (id) => {
  return connectedUsers.find((user) => user.id === id);
};

// called when the user leaves the chat and its object gets deleted from the array
const disconnectUserHandler = (id) => {
  const index = connectedUsers.findIndex((user) => user.id === id);
  if (index !== -1) return connectedUsers.splice(index, 1)[0];
};

module.exports = {
  joinedUsersHandler,
  getUserHandler,
  disconnectUserHandler,
};
