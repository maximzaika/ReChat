import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";
const dateFormat = require("dateformat");

const initialState = {
  friends: [],
  messages: [],
  isFetching: false,
  isError: null,
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

const socketOnMessageReceived = (
  state,
  {
    isActiveChat,
    authUserId,
    messageId,
    senderId,
    recipientId,
    timestamp,
    message,
  }
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
    case actions.SOCKET_CONNECTED:
      return state;
    case actions.SOCKET_DISCONNECTED:
      return state;
    case actions.SOCKET_SEND_MESSAGE:
      return state;
    case actions.SOCKET_TYPING_MESSAGE:
      return state;
    case actions.SOCKET_RECEIVED_MESSAGE:
      return state;
    case actions.SOCKET_SEEN_MESSAGE:
      return state;
    case actions.SOCKET_ON_ONLINE_STATE:
      return socketOnOnlineState(state, action);
    case actions.SOCKET_ON_TYPING_STATE:
      return socketOnTypingState(state, action);
    case actions.SOCKET_ON_MESSAGE_RECEIVED:
      return socketOnMessageReceived(state, action);
    default:
      return state;
  }
};

export default socketReducer;
