import * as actions from "../actionTypes";
import Cookies from "cookies-js";
import { firebaseAuthenticationAPIKey } from "../../services/apis";

const firebaseUrl = "https://identitytoolkit.googleapis.com/v1/accounts:";
const authSignUp = "signUp?key=";
const authSigIn = "signInWithPassword?key=";

export const authStart = () => {
  return {
    type: actions.AUTH_START,
  };
};

export const authSuccess = (token, userId) => {
  return {
    type: actions.AUTH_SUCCESS,
    token: token,
    userId: userId,
  };
};

export const authFail = (errorType) => {
  let errorMessage = "";
  switch (errorType) {
    case "EMAIL_EXISTS":
      errorMessage =
        "Email already exists, try another email or login instead.";
      break;
    case "OPERATION_NOT_ALLOWED":
      errorMessage = "Authentication is currently disabled. Try again later.";
      break;
    case "EMAIL_NOT_FOUND":
      errorMessage =
        "Email doesn't exist. Try another email or create a new account.";
      break;
    case "INVALID_EMAIL":
      errorMessage = "Invalid email. Ensure it is accurate and not empty.";
      break;
    case "INVALID_PASSWORD":
      errorMessage = "Invalid password. Ensure it is accurate and not empty.";
      break;
    default:
      errorMessage = "You have attempting too many times. Try again later.";
  }

  return {
    type: actions.AUTH_FAIL,
    error: errorMessage,
  };
};

export const authLogout = () => {
  Cookies.expire("token");
  Cookies.expire("userId");
  return {
    type: actions.AUTH_LOGOUT,
  };
};

export const setAuthRedirectPath = (path) => {
  return {
    type: actions.AUTH_SET_REDIRECT_PATH,
    path: path,
  };
};

export const authReset = () => {
  return {
    type: actions.AUTH_RESET,
  };
};

export const auth = (email, password, isToSignUp) => {
  return (dispatch) => {
    dispatch(authStart());

    const data = {
      email: email,
      password: password,
      returnSecureToken: true,
    };

    let url = isToSignUp
      ? firebaseUrl + authSignUp + firebaseAuthenticationAPIKey
      : firebaseUrl + authSigIn + firebaseAuthenticationAPIKey;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then((response) => {
        // console.log(response);
        const idToken = response.idToken;
        const localId = response.localId;
        const expiresIn = response.expiresIn;
        Cookies.set("token", idToken, { expires: expiresIn });
        Cookies.set("userId", localId, { expires: expiresIn });
        dispatch(authSuccess(idToken, localId));
      })
      .catch((response) => {
        console.log(response);
        response.json().then((json) => {
          console.log(json);
          dispatch(authFail(json.error.message));
        });
      });
  };
};

export const authCheckAuthToken = () => {
  return (dispatch) => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    if (token === undefined && userId === undefined) {
      dispatch(authLogout());
      return;
    }

    dispatch(authSuccess(token, userId));
  };
};
