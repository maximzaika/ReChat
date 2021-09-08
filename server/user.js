function User(
  id,
  userId,
  uniqueId,
  avatar,
  name,
  lastMessage,
  time,
  onlineState,
  typingState,
  lastOnline,
  userColor
) {
  this.id = id;
  this.userId = userId;
  this.uniqueId = uniqueId;
  this.avatar = avatar;
  this.name = name;
  this.lastMessage = lastMessage;
  this.time = time;
  this.onlineState = onlineState;
  this.typingState = typingState;
  this.lastOnline = lastOnline;
  this.userColor = userColor;
}

module.exports = User;
