import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";

const initialState = {
  friends: [],
  messages: [],
  isFetchingFriends: false,
  isFetchingMessages: false,
  isErrorFetchingFriends: null,
  isErrorFetchingMessages: null,
};

const fetchFriendsStart = (state) =>
  updateObject(state, {
    isFetchingFriends: true,
    isErrorFetchingFriends: null,
  });

const fetchMessagesStart = (state) =>
  updateObject(state, {
    isFetchingMessages: true,
    isErrorFetchingMessages: null,
  });

const fetchFriendsSuccess = (state, action) =>
  updateObject(state, {
    isFetchingFriends: false,
    isErrorFetchingFriends: null,
    friends: action.friends,
  });

const fetchMessagesSuccess = (state, action) =>
  updateObject(state, {
    isFetchingMessages: false,
    isErrorFetchingMessages: null,
    messages: action.messages,
  });

const fetchFriendsError = (state, action) =>
  updateObject(state, {
    isFetchingFriends: false,
    isErrorFetchingFriends: action.error,
  });

const fetchMessagesError = (state, action) =>
  updateObject(state, {
    isFetchingMessages: false,
    isErrorFetchingMessages: action.error,
  });

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SOCKET_FETCH_FRIENDS_START:
      return fetchFriendsStart(state);
    case actions.SOCKET_FETCH_MESSAGES_START:
      return fetchMessagesStart(state);
    case actions.SOCKET_FETCH_FRIENDS_SUCCESS:
      return fetchFriendsSuccess(state, action);
    case actions.SOCKET_FETCH_MESSAGES_SUCCESS:
      return fetchMessagesSuccess(state, action);
    case actions.SOCKET_FETCH_FRIENDS_ERROR:
      return fetchFriendsError(state, action);
    case actions.SOCKET_FETCH_MESSAGES_ERROR:
      return fetchMessagesError(state, action);
    default:
      return state;
  }
};

export default socketReducer;
