import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";
const dateFormat = require("dateformat");

/** @param {
 *  {
 *    friends: [],
 *    messages: {},
 *    isFetching: boolean,
 *    isError: null | string,
 *    isActiveChat: {
 *      userId: null | string,
 *      index: null | number
 *    }
 *  }
 * } initialState */
const initialState = {
  friends: [],
  messages: {},
  isFetching: false,
  isError: null,
  isActiveChat: {
    friendId: null,
    index: null,
  },
};

const fetchStart = (state) =>
  updateObject(state, {
    isFetching: true,
    isError: null,
  });

const fetchFriendsSuccess = (state, action) =>
  updateObject(state, {
    isError: null,
    friends: action.friends,
  });

const fetchMessagesSuccess = (state, action) =>
  updateObject(state, {
    isFetching: false,
    isError: null,
    messages: action.messages,
  });

const fetchError = (state, action) =>
  updateObject(state, {
    isFetching: false,
    isErrorFetching: action.error,
  });

const updateInput = (state, { input, userTyping }) => {
  const friends = [...state.friends];
  friends[state.isActiveChat.index].inputMessage = input;
  return updateObject(state, { friends: friends });
};

const updateFriends = (state, { senderId, authUserId, message, timestamp }) => {
  const friends = [...state.friends];
  let index = -1;
  if (senderId === authUserId) {
    index = friends.findIndex((user) => senderId === user.userId);
  } else {
    index = friends.findIndex((user) => senderId === user.id);
  }

  if (index === -1) return state;
  friends[index].lastMessage = message;
  friends[index].time = timestamp;

  return updateObject(state, { friends: friends });
};

const addMessage = (
  state,
  {
    authUserId,
    temporaryId,
    senderId,
    recipientId,
    timestamp,
    encryptedMessage,
    messageState,
  }
) => {
  const updatedState = {
    ...updateFriends(state, {
      senderId: senderId,
      authUserId: authUserId,
      message: encryptedMessage,
      timestamp: timestamp,
    }),
  };
  updatedState.messages[recipientId] = [
    {
      id: temporaryId,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: timestamp,
      message: encryptedMessage,
      messageStatus: messageState,
    },
    ...updatedState.messages[recipientId],
  ];
  return updateObject(state, { ...updatedState });
};

const socketEmitTyping = (state, { userTyping }) => {
  const friends = [...state.friends];
  friends[state.isActiveChat.index].userTyping = userTyping;
  return updateObject(state, { friends: friends });
};

const socketOnOnlineState = (state, { userId, onlineState, lastOnline }) => {
  const friends = [...state.friends];
  friends.map((friend) => {
    if (friend.id !== userId) return friend;
    friend.onlineState = onlineState;
    friends.lastOnline = dateFormat(lastOnline, "isoDateTime");
    return friend;
  });
  return updateObject(state, { friends: friends });
};

const socketOnTypingState = (state, { userId, typingState }) => {
  const friends = [...state.friends];
  friends.map((friend) => {
    if (friend.id !== userId) return friend;
    friend.typingState = typingState;
    return friend;
  });
  return updateObject(state, { friends: friends });
};

const setActiveChat = (state, { friendId, index }) => {
  console.log(index);

  // if (!index) {
  return updateObject(state, {
    isActiveChat: updateObject(state.isActiveChat, {
      friendId: friendId,
      index: index,
    }),
  });
  // }

  // return updateObject(state, {
  //   isActiveChat: updateObject(state.isActiveChat, { friendId: friendId }),
  // });
};

const showChat = (state, { friendId }) => {
  if (friendId in state.messages) return state;
  return updateObject(state, {
    messages: { ...state.messages, [friendId]: [] },
  });
};

const socketOnNewMessage = (
  state,
  { authUserId, messageId, senderId, recipientId, timestamp, message }
) => {
  const updatedState = {
    ...updateFriends(state, {
      senderId: senderId,
      authUserId: authUserId,
      message: message,
      timestamp: timestamp,
    }),
  };

  // sort users with new messages to the top of the friend list
  updatedState.friends.sort((a, b) => new Date(b.time) - new Date(a.time));

  /* if chat is active, then need to keep track of the new index after the sort
     to ensure that it doesn't get closed */
  let activeChatIndex = state.isActiveChat.index;
  if (state.isActiveChat.userId) {
    activeChatIndex = updatedState.friends.findIndex(
      (friend) => friend.id === state.isActiveChat.userId
    );
  }

  // const messages = { ...state.messages };
  const user = senderId === authUserId ? recipientId : senderId;
  updatedState.messages[user] = [
    {
      id: messageId,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: timestamp,
      message: message,
      messageStatus: -1,
    },
    ...updatedState.messages[user],
  ];

  updatedState.isActiveChat.index = activeChatIndex;

  return updateObject(state, { ...updatedState });

  // return updateObject(state, {
  //   friends: friends,
  //   messages: messages,
  //   isActiveChat: updateObject(state.isActiveChat, {
  //     index: activeChatIndex,
  //   }),
  // });
};

const socketOnMessageSent = (
  state,
  { authUserId, temporaryMessageId, newMessageId, userId, recipientId }
) => {
  const messages = { ...state.messages };
  console.log("new", { ...state.messages });
  const friendId = userId === authUserId ? recipientId : userId;
  const index = messages[friendId].findIndex(
    (message) => message.id === temporaryMessageId
  );

  if (index > -1) {
    console.log("[redux] updating id and messageStatus");
    messages[friendId][index].id = newMessageId;
    messages[friendId][index].messageStatus = 0;
  }

  return updateObject(state, { messages: messages });
};

const socketOnMessageState = (
  state,
  { authUserId, messagesId, userId, recipientId, msgState }
) => {
  const messages = { ...state.messages };
  const friendId = userId === authUserId ? recipientId : userId;

  // console.log("userId", userId);
  // console.log("authUserId", authUserId);
  // console.log("recipientId", recipientId);
  // console.log("state", { ...state.messages });

  for (let messageId of messagesId) {
    const index = messages[friendId].findIndex(
      (message) => message.id === messageId
    );
    if (index > -1) messages[friendId][index].messageStatus = msgState;
  }

  return updateObject(state, { messages: messages });
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SOCKET_FETCH_START:
      return fetchStart(state);
    case actions.SOCKET_FETCH_FRIENDS_SUCCESS:
      return fetchFriendsSuccess(state, action);
    case actions.SOCKET_FETCH_MESSAGES_SUCCESS:
      return fetchMessagesSuccess(state, action);
    case actions.SOCKET_FETCH_ERROR:
      return fetchError(state, action);
    case actions.SOCKET_UPDATE_INPUT:
      return updateInput(state, action);
    case actions.SOCKET_SHOW_ACTIVE_CHAT:
      return showChat(state, action);
    case actions.SOCKET_SET_ACTIVE_CHAT:
      return setActiveChat(state, action);
    case actions.SOCKET_CONNECTED:
      return state;
    case actions.SOCKET_DISCONNECTED:
      return state;
    case actions.SOCKET_EMIT_MESSAGE:
      return addMessage(state, action);
    case actions.SOCKET_EMIT_TYPING:
      return socketEmitTyping(state, action);
    case actions.SOCKET_EMIT_RECEIVED:
      return state;
    case actions.SOCKET_EMIT_SEEN:
      return state;
    case actions.SOCKET_ON_ONLINE:
      return socketOnOnlineState(state, action);
    case actions.SOCKET_ON_TYPING:
      return socketOnTypingState(state, action);
    case actions.SOCKET_ON_MESSAGE:
      return socketOnNewMessage(state, action);
    case actions.SOCKET_ON_MESSAGE_SENT:
      return socketOnMessageSent(state, action);
    case actions.SOCKET_ON_MESSAGE_STATE:
      return socketOnMessageState(state, action);
    default:
      return state;
  }
};

export default socketReducer;
