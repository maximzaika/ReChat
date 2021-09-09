import * as actions from "../actionTypes";
import * as socketActions from "../../shared/socketIoActionTypes";

const fetchFriendsStart = () => ({
  type: actions.SOCKET_FETCH_FRIENDS_START,
});

const fetchFriendsSuccess = (friendsData) => {
  const tempFriends = [...friendsData];
  for (let friend of tempFriends) {
    friend["userColor"] = Math.floor(Math.random() * 5);
  }

  return { type: actions.SOCKET_FETCH_FRIENDS_SUCCESS, friends: tempFriends };
};

const fetchFriendsError = (err) => ({
  type: actions.SOCKET_FETCH_FRIENDS_ERROR,
  error: err,
});

const fetchMessagesStart = () => ({
  type: actions.SOCKET_FETCH_MESSAGES_START,
});

const fetchMessagesSuccess = (messagesData) => ({
  type: actions.SOCKET_FETCH_MESSAGES_SUCCESS,
  messages: messagesData,
});

const fetchMessagesError = (err) => ({
  type: actions.SOCKET_FETCH_MESSAGES_ERROR,
  error: err,
});

export const fetchFriends = (isAuth, data) => (dispatch) => {
  if (!isAuth) return dispatch(fetchFriendsError("ERROR: Please login."));

  dispatch(fetchFriendsStart());

  fetch("/friendList", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((friends) => {
      for (let friend in friends) {
        friends[friend]["inputMessage"] = "";
        friends[friend]["userColor"] = "";
      }
      dispatch(fetchFriendsSuccess(friends));
    });
};

export const fetchMessages = (isAuth, data) => (dispatch) => {
  if (!isAuth) return dispatch(fetchMessagesError("ERROR: Please login."));

  dispatch(fetchMessagesStart());

  fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((messages) => dispatch(fetchMessagesSuccess(messages)));
};

export const connectUser =
  (socket, userId, recipientId, roomId) => (dispatch) => {
    socket.emit(socketActions.joinRoom, {
      userId: userId,
      recipientId: recipientId,
      roomId: roomId,
    });
  };

export const disconnectUser = (socket) => (dispatch) => {
  socket.emit(socketActions.disconnectRoom);
};

export const sendMessage =
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
    socket.emit(socketActions.sendMessage, {
      temporaryId: temporaryMessageId,
      senderId: senderId,
      recipientId: recipientId,
      roomId: roomId,
      timestamp: timestamp,
      message: encryptedMessage,
    });
  };

export const setUserTypingState =
  (socket, isTyping, roomId, senderId = null) =>
  (dispatch) => {
    socket.emit(socketActions.typingState, {
      isTyping: isTyping,
      senderId: senderId,
      roomId: roomId,
    });
  };

export const setMessageReceivedState = (socket, userId, recipientId) => {
  socket.emit(socketActions.messageState, {
    userId: userId,
    recipientId: recipientId,
  });
};

export const setMessageSeenState =
  (socket, messageId, senderId, recipientId) => (dispatch) => {
    socket.emit(socketActions.messageSeen, {
      messageId: messageId,
      userId: senderId,
      recipientId: recipientId,
    });
  };
