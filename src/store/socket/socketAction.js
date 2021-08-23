import * as actions from "../actionTypes";

export const socketProcess = (encrypt, text, cypher) => {
  return {
    type: actions.SOCKET_PROCESS,
    payload: {
      encrypt,
      text,
      cypher,
    },
  };
};
