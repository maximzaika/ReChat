import * as actions from "../actionTypes";
import * as socketActions from "../../shared/socketIoActionTypes";
import dateFormat from "dateformat";
import { v4 as uuid } from "uuid";
import { toEncrypt } from "../../shared/aes";

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
// socketSendMessage(
//   temporaryMessageId,
//   senderId,
//   recipientId,
//   timestamp,
//   encryptedMessage,
//   -1
// )
const socketSendMessage = (
  authUserId,
  temporaryId,
  senderId,
  recipientId,
  timestamp,
  message,
  encryptedMessage
) => ({
  type: actions.SOCKET_EMIT_MESSAGE,
  authUserId: authUserId,
  temporaryId: temporaryId,
  senderId: senderId,
  recipientId: recipientId,
  timestamp: timestamp,
  message: message,
  encryptedMessage: encryptedMessage,
  messageStatus: -1,
});

const socketNotifyTypingMessage = () => ({
  type: actions.SOCKET_EMIT_TYPING,
});

const socketReceivedMessage = () => ({
  type: actions.SOCKET_EMIT_RECEIVED,
});

const socketSeenMessage = () => ({
  type: actions.SOCKET_EMIT_SEEN,
});

const socketChangeOnlineState = (userId, onlineState, lastOnline) => ({
  type: actions.SOCKET_ON_ONLINE,
  userId: userId,
  onlineState: onlineState,
  lastOnline: lastOnline,
});

const socketChangeTypingState = (userId, typingState) => ({
  type: actions.SOCKET_ON_TYPING,
  userId: userId,
  typingState: typingState,
});

const socketNewMessage = (
  authUserId,
  messageId,
  senderId,
  recipientId,
  timestamp,
  message
) => ({
  type: actions.SOCKET_ON_MESSAGE,
  authUserId: authUserId,
  messageId: messageId,
  senderId: senderId,
  recipientId: recipientId,
  timestamp: timestamp,
  message,
});

const socketOnMessageSent = (
  authUserId,
  temporaryMessageId,
  newMessageId,
  userId,
  recipientId
) => ({
  type: actions.SOCKET_ON_MESSAGE_SENT,
  authUserId: authUserId,
  temporaryMessageId: temporaryMessageId,
  newMessageId: newMessageId,
  userId: userId,
  recipientId: recipientId,
});

const socketOnMessageState = (
  authUserId,
  messagesId,
  userId,
  recipientId,
  msgState
) => ({
  type: actions.SOCKET_ON_MESSAGE_STATE,
  authUserId: authUserId,
  messagesId: messagesId,
  userId: userId,
  recipientId: recipientId,
  msgState: msgState,
});

export const setActiveChat = (friendId, index = null) => ({
  type: actions.SOCKET_SET_ACTIVE_CHAT,
  friendId: friendId,
  index: index,
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
  (socket, senderId, recipientId, roomId, message) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    const temporaryMessageId = uuid();
    const timestamp = dateFormat(new Date(), "isoDateTime");
    const encryptedMessage = toEncrypt(message);

    dispatch(
      socketSendMessage(
        authUserId,
        temporaryMessageId,
        senderId,
        recipientId,
        timestamp,
        message,
        encryptedMessage
      )
    );

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
    dispatch(socketNotifyTypingMessage());
    socket.emit(socketActions.typingState, {
      isTyping: isTyping,
      roomId: roomId,
      senderId: senderId,
    });
  };

// export const emitMessageReceivedState =
//   (socket, userId, recipientId) => (dispatch) => {
//     dispatch(socketReceivedMessage());
//     socket.emit(socketActions.messageState, {
//       userId: userId,
//       recipientId: recipientId,
//     });
//   };

export const emitMessageSeenState =
  (socket, messageId, senderId, recipientId) => (dispatch, getState) => {
    const socketState = getState().socket;
    if (senderId !== socketState.isActiveChat.friendId) return;
    dispatch(socketSeenMessage());
    socket.emit(socketActions.messageSeen, {
      messageId: messageId,
      userId: senderId,
      recipientId: recipientId,
    });
  };

export const onOnlineStateChange =
  (recipientId, userId, online, lastOnline) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    if (recipientId !== authUserId) return;
    dispatch(socketChangeOnlineState(userId, online, lastOnline));
  };

export const onTypingStateChange =
  (recipientId, userId, typingState) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    if (recipientId !== authUserId) return;
    dispatch(socketChangeTypingState(userId, typingState));
  };

export const onNewMessage =
  (socket, messageId, senderId, recipientId, timestamp, message) =>
  (dispatch, getState) => {
    const activeFriendId = getState().socket.isActiveChat.friendId;
    const authUserId = getState().auth.userId;
    dispatch(
      socketNewMessage(
        authUserId,
        messageId,
        senderId,
        recipientId,
        timestamp,
        message
      )
    );
    /* if message is received by another client then
        notify the server (only if another friend's chat is active) */
    // if (activeFriendId !== senderId) return;
    // dispatch(emitMessageReceivedState(socket, authUserId, senderId));
    dispatch(socketReceivedMessage());
    console.log("test");
    socket.emit(socketActions.messageState, {
      userId: authUserId,
      recipientId: senderId,
    });
  };

export const onMessageSent =
  (temporaryMessageId, newMessageId, userId, recipientId) =>
  (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    if (userId !== authUserId) return;
    dispatch(
      socketOnMessageSent(
        authUserId,
        temporaryMessageId,
        newMessageId,
        userId,
        recipientId
      )
    );
  };

export const onMessageState =
  (messagesId, userId, recipientId, msgState) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    if (userId !== authUserId) return;

    dispatch(
      socketOnMessageState(
        authUserId,
        messagesId,
        userId,
        recipientId,
        msgState
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
