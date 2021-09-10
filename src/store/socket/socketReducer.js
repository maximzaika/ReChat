import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";

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
    default:
      return state;
  }
};

export default socketReducer;
