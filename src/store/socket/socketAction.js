import * as actions from "../actionTypes";
import * as socketActions from "../../shared/socketIoActionTypes";

const fetchFriendsSuccess = (friendsData) => {
  const tempFriends = [...friendsData];

  for (let friend in tempFriends) {
    tempFriends[friend]["inputMessage"] = "";
    tempFriends[friend]["userColor"] = Math.floor(Math.random() * 5);
  }

  return { type: actions.SOCKET_FETCH_FRIENDS_SUCCESS, friends: tempFriends };
};

const fetchError = (err) => ({
  type: actions.SOCKET_FETCH_ERROR,
  error: err,
});

const fetchStart = () => ({
  type: actions.SOCKET_FETCH_START,
});

const fetchMessagesSuccess = (messagesData) => ({
  type: actions.SOCKET_FETCH_MESSAGES_SUCCESS,
  messages: messagesData,
});

const socketConnected = () => ({
  type: actions.SOCKET_CONNECTED,
});

const socketDisconnected = () => ({
  type: actions.SOCKET_DISCONNECTED,
});

const socketSendMessage = () => ({
  type: actions.SOCKET_SEND_MESSAGE,
});

const socketTypingMessage = () => ({
  type: actions.SOCKET_TYPING_MESSAGE,
});

const socketReceivedMessage = () => ({
  type: actions.SOCKET_RECEIVED_MESSAGE,
});

const socketSeenMessage = () => ({
  type: actions.SOCKET_SEEN_MESSAGE,
});

const socketChangeOnlineState = (userId, onlineState, lastOnline) => ({
  type: actions.SOCKET_ON_ONLINE_STATE,
  userId: userId,
  onlineState: onlineState,
  lastOnline: lastOnline,
});

const socketChangeTypingState = (userId, typingState) => ({
  type: actions.SOCKET_ON_TYPING_STATE,
  userId: userId,
  typingState: typingState,
});

const socketMessageReceived = (
  isActiveChat,
  authUserId,
  messageId,
  senderId,
  recipientId,
  timestamp,
  message
) => ({
  type: actions.SOCKET_ON_MESSAGE_RECEIVED,
  isActiveChat: isActiveChat,
  authUserId: authUserId,
  messageId: messageId,
  senderId: senderId,
  recipientId: recipientId,
  timestamp: timestamp,
  message,
});

export const emitConnectUser =
  (socket, userId, recipientId, roomId) => (dispatch) => {
    dispatch(socketConnected());
    socket.emit(socketActions.joinRoom, {
      userId: userId,
      recipientId: recipientId,
      roomId: roomId,
    });
  };

export const emitDisconnectUser = (socket) => (dispatch) => {
  dispatch(socketDisconnected());
  socket.emit(socketActions.disconnectRoom);
};

export const emitMessage =
  (
    socket,
    temporaryMessageId,
    senderId,
    recipientId,
    roomId,
    timestamp,
    encryptedMessage
  ) =>
  (dispatch) => {
    dispatch(socketSendMessage());
    socket.emit(socketActions.sendMessage, {
      temporaryId: temporaryMessageId,
      senderId: senderId,
      recipientId: recipientId,
      roomId: roomId,
      timestamp: timestamp,
      message: encryptedMessage,
    });
  };

export const emitUserTypingState =
  (socket, isTyping, roomId, senderId) => (dispatch) => {
    dispatch(socketTypingMessage());
    socket.emit(socketActions.typingState, {
      isTyping: isTyping,
      roomId: roomId,
      senderId: senderId,
    });
  };

export const emitMessageReceivedState =
  (socket, userId, recipientId) => (dispatch) => {
    dispatch(socketReceivedMessage());
    socket.emit(socketActions.messageState, {
      userId: userId,
      recipientId: recipientId,
    });
  };

export const emitMessageSeenState =
  (socket, isActiveChat, messageId, senderId, recipientId) => (dispatch) => {
    if (senderId !== isActiveChat) return;
    dispatch(socketSeenMessage());
    socket.emit(socketActions.messageSeen, {
      messageId: messageId,
      userId: senderId,
      recipientId: recipientId,
    });
  };

export const onOnlineStateChange =
  (recipientId, authUserId, userId, online, lastOnline) => (dispatch) => {
    if (recipientId !== authUserId) return;
    dispatch(socketChangeOnlineState(userId, online, lastOnline));
  };

export const onTypingStateChange =
  (recipientId, authUserId, userId, typingState) => (dispatch) => {
    if (recipientId !== authUserId) return;
    dispatch(socketChangeTypingState(userId, typingState));
  };

export const onMessageReceive =
  (
    isActiveChat,
    authUserId,
    messageId,
    senderId,
    recipientId,
    timestamp,
    message
  ) =>
  (dispatch) => {
    dispatch(
      socketMessageReceived(
        isActiveChat,
        authUserId,
        messageId,
        senderId,
        recipientId,
        timestamp,
        message
      )
    );
  };

export const fetchData = (isAuth, data) => (dispatch) => {
  if (!isAuth) return dispatch(fetchError("ERROR: Please login."));

  dispatch(fetchStart());

  const config = {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  };

  // fetch friends and then their messages
  fetch("/friendList", config)
    .then((res) => res.json())
    .then((friends) => {
      if (!friends) return;
      dispatch(fetchFriendsSuccess(friends));
      return fetch("/messages", config);
    })
    .then((res) => res.json())
    .then((messages) => dispatch(fetchMessagesSuccess(messages)))
    .catch((err) => dispatch(fetchError(err)));
};
