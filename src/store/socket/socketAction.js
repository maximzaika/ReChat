import * as actions from "../actionTypes";
import * as socketActions from "../../shared/socketIoActionTypes";
import dateFormat from "dateformat";
import { v4 as uuid } from "uuid";
import { toEncrypt } from "../../shared/aes";
import { SOCKET_EMIT_MESSAGE_DELETE } from "../actionTypes";

const fetchFriendsSuccess = (friendsData) => {
  const tempFriends = [...friendsData];

  for (let friend in tempFriends) {
    tempFriends[friend]["inputMessage"] = "";
    tempFriends[friend]["userColor"] = Math.floor(Math.random() * 5);
    tempFriends[friend]["userTyping"] = false;
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

const updateInput = (value) => ({
  type: actions.SOCKET_UPDATE_INPUT,
  input: value,
});

const setActiveChat = (friendId, index) => ({
  type: actions.SOCKET_SET_ACTIVE_CHAT,
  friendId: friendId,
  index: index,
});

const socketConnected = () => ({
  type: actions.SOCKET_CONNECTED,
});

const socketDisconnected = () => ({
  type: actions.SOCKET_DISCONNECTED,
});

const emitConnectUser = (socket, userId, recipientId, roomId) => (dispatch) => {
  dispatch(socketConnected());
  socket.emit(socketActions.joinRoom, {
    userId: userId,
    recipientId: recipientId,
    roomId: roomId,
  });
};

const emitDisconnectUser = (socket) => (dispatch) => {
  console.log("disconnected");
  dispatch(socketDisconnected());
  socket.emit(socketActions.disconnectRoom);
};

const showActiveChat = (friendId, index) => ({
  type: actions.SOCKET_SHOW_ACTIVE_CHAT,
  friendId: friendId,
  index: index,
});

const emitOnlineState = (socket, uniqueId, userId, friendId) => (dispatch) => {
  socket.emit(socketActions.onlineStatus, {
    roomId: uniqueId,
    userId: userId,
    recipientId: friendId,
  });
};

export const showChat =
  (socket, friendId, index, uniqueId) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    const friends = getState().socket.friends;
    const isActiveChat = getState().socket.isActiveChat.friendId;
    if (friends.length < 0 || isActiveChat === friendId || !uniqueId) return;

    if (friendId || friendId !== "") {
      dispatch(emitConnectUser(socket, authUserId, friendId, uniqueId));
      // console.log("test", isActiveChat);
      if (isActiveChat) dispatch(emitDisconnectUser(socket));
      // console.log({ uniqueId, authUserId, friendId });
      dispatch(emitOnlineState(socket, uniqueId, authUserId, friendId));
    }

    dispatch(showActiveChat(friendId, index));
    dispatch(setActiveChat(friendId, index));
  };

const socketEmitMessage = (
  authUserId,
  temporaryId,
  senderId,
  recipientId,
  timestamp,
  encryptedMessage
) => ({
  type: actions.SOCKET_EMIT_MESSAGE,
  authUserId: authUserId,
  temporaryId: temporaryId,
  senderId: senderId,
  recipientId: recipientId,
  timestamp: timestamp,
  encryptedMessage: encryptedMessage,
  messageStatus: -1,
});

const socketEmitTyping = (userTyping) => ({
  type: actions.SOCKET_EMIT_TYPING,
  userTyping: userTyping,
});

const socketEmitReceived = () => ({
  type: actions.SOCKET_EMIT_RECEIVED,
});

const socketEmitSeen = () => ({
  type: actions.SOCKET_EMIT_SEEN,
});

const socketChangeOnlineState = (userId, onlineState, lastOnline) => ({
  type: actions.SOCKET_ON_ONLINE,
  userId: userId,
  onlineState: onlineState,
  lastOnline: lastOnline,
});

const socketOnTyping = (userId, typingState) => ({
  type: actions.SOCKET_ON_TYPING,
  userId: userId,
  typingState: typingState,
});

const socketOnMessage = (
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

const socketEmitMessageDelete = () => ({
  type: actions.SOCKET_EMIT_MESSAGE_DELETE,
});

const socketOnMessageDelete = (messageId, message) => ({
  type: actions.SOCKET_ON_MESSAGE_DELETE,
  messageId,
  message,
});

const emitUserTypingState =
  (socket, isTyping, roomId, senderId) => (dispatch) => {
    dispatch(socketEmitTyping(isTyping));
    socket.emit(socketActions.typingState, {
      isTyping: isTyping,
      roomId: roomId,
      senderId: senderId,
    });
  };

export const emitMessage =
  (socket, senderId, recipientId, roomId, message) => (dispatch, getState) => {
    const authUserId = getState().auth.userId;
    const temporaryMessageId = uuid();
    const timestamp = dateFormat(new Date(), "isoDateTime");
    const encryptedMessage = toEncrypt(message);

    dispatch(emitUserTypingState(socket, false, roomId, senderId));

    dispatch(
      socketEmitMessage(
        authUserId,
        temporaryMessageId,
        senderId,
        recipientId,
        timestamp,
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

    dispatch(updateInput(""));
  };

export const emitMessageSeenState =
  (socket, messageId, senderId, recipientId) => (dispatch, getState) => {
    const socketState = getState().socket;
    if (senderId !== socketState.isActiveChat.friendId) return;
    dispatch(socketEmitSeen());
    socket.emit(socketActions.messageSeen, {
      messageId: messageId,
      userId: senderId,
      recipientId: recipientId,
    });
  };

export const emitMessageDelete =
  (socket, messageId) => (dispatch, getState) => {
    const activeChatId = getState().socket.isActiveChat.index;
    const selectedChat = getState().socket.friends[activeChatId];
    dispatch(socketEmitMessageDelete());
    socket.emit(socketActions.messageDelete, {
      messageId: messageId,
      roomId: selectedChat.uniqueId,
    });
  };

export const onMessageDelete =
  (isDeleted, messageId, message) => (dispatch) => {
    if (!isDeleted) return alert("ERROR: Message couldn't be deleted.");

    dispatch(socketOnMessageDelete(messageId, message));
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
    dispatch(socketOnTyping(userId, typingState));
  };

export const onNewMessage =
  (socket, messageId, senderId, recipientId, timestamp, message) =>
  (dispatch, getState) => {
    const activeFriendId = getState().socket.isActiveChat.friendId;
    const authUserId = getState().auth.userId;
    dispatch(
      socketOnMessage(
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
    dispatch(socketEmitReceived());
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

export const messageInput = (socket, value) => (dispatch, getState) => {
  const authUserId = getState().auth.userId;
  const indexActiveChat = getState().socket.isActiveChat.index;
  const friends = getState().socket.friends;
  const currTyping = friends[indexActiveChat].userTyping;

  // notify receiver that sender is not typing
  if (value.length < 1 && currTyping) {
    dispatch(
      emitUserTypingState(
        socket,
        false,
        friends[indexActiveChat].uniqueId,
        authUserId
      )
    );
  }

  // notify receiver that sender is typing
  if (value.length > 0 && !currTyping) {
    dispatch(
      emitUserTypingState(
        socket,
        true,
        friends[indexActiveChat].uniqueId,
        authUserId
      )
    );
  }

  dispatch(updateInput(value));
};

export const fetchData = (socket, isAuth, data) => (dispatch, getState) => {
  if (!isAuth) return dispatch(fetchError("ERROR: Please login."));
  const authUserId = getState().auth.userId;

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
      for (let friend of friends) {
        // console.log(friend);
        dispatch(
          emitConnectUser(socket, authUserId, friend.id, friend.uniqueId)
        );
      }
      dispatch(fetchFriendsSuccess(friends));
      return fetch("/messages", config);
    })
    .then((res) => res.json())
    .then((messages) => dispatch(fetchMessagesSuccess(messages)))
    .catch((err) => dispatch(fetchError(err)));
};
