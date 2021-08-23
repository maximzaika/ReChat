const connectedUsers = [];

// called when user decides to join the chatroom
const joinedUsersHandler = (id, username) => {
  const user = { id, username };
  if (connectedUsers.find((user) => user.id === id)) {
    console.log("connected existing user:", user);
    return { type: 1, data: user };
  }
  connectedUsers.push(user);
  console.log(connectedUsers, "users");
  return { type: 0, data: user };
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
