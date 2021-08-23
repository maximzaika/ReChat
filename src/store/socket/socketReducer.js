import * as actions from "../actionTypes";
import { updateObject } from "../../shared/updateData";

const initialState = {};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SOCKET_PROCESS:
      return updateObject(state, { ...action.payload });
    default:
      return state;
  }
};

export default socketReducer;
