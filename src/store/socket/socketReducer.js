import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";
import { SOCKET_ON_MESSAGE } from "../actionTypes";
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
  if (!index) {
    return updateObject(state, {
      isActiveChat: updateObject(state.isActiveChat, {
        friendId: friendId,
        index: index,
      }),
    });
  }

  return updateObject(state, {
    isActiveChat: updateObject(state.isActiveChat, { friendId: friendId }),
  });
};

const socketOnNewMessage = (
  state,
  { authUserId, messageId, senderId, recipientId, timestamp, message }
) => {
  const friends = [...state.friends];
  friends.map((friend) => {
    let found = false;
    if (senderId === authUserId && senderId === friend.userId) found = true;
    if (senderId !== authUserId && senderId === friend.id) found = true;
    if (!found) return friend;

    friend.lastMessage = message;
    friend.time = timestamp;
    return friend;
  });

  // sort users with new messages to the top of the friend list
  friends.sort((a, b) => new Date(b.time) - new Date(a.time));

  /* if chat is active, then need to keep track of the new index after the sort
     to ensure that it doesn't get closed */
  let activeChatIndex = state.isActiveChat.index;
  if (state.isActiveChat.userId) {
    activeChatIndex = friends.findIndex(
      (friend) => friend.id === state.isActiveChat.userId
    );
    // setActiveChat(state, {
    //   friendId: state.isActiveChat.userId,
    //   index: isActiveChatIndex,
    // });
  }

  const messages = { ...state.messages };
  const user = senderId === authUserId ? recipientId : senderId;
  messages[user] = [
    {
      id: messageId,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: timestamp,
      message: message,
      messageStatus: -1,
    },
    ...messages[user],
  ];

  return updateObject(state, {
    friends: friends,
    messages: messages,
    isActiveChat: updateObject(state.isActiveChat, {
      index: activeChatIndex,
    }),
  });
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
    case actions.SOCKET_SET_ACTIVE_CHAT:
      return setActiveChat(state, action);
    case actions.SOCKET_CONNECTED:
      return state;
    case actions.SOCKET_DISCONNECTED:
      return state;
    case actions.SOCKET_EMIT_MESSAGE:
      return state;
    case actions.SOCKET_EMIT_TYPING:
      return state;
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
    default:
      return state;
  }
};

export default socketReducer;
