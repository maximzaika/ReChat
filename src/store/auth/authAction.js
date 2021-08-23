import * as actions from "../actionTypes";
import Cookies from "cookies-js";
import { firebaseAuthenticationAPIKey } from "../../services/apis";

const firebaseUrl = "https://identitytoolkit.googleapis.com/v1/accounts:";
const authSignUp = "signUp?key=";
const authSigIn = "signInWithPassword?key=";

const authStart = () => {
  return {
    type: actions.AUTH_START,
  };
};

const authSuccess = (token, userId, expiresIn, firstName, surName) => {
  Cookies.set("token", token, { expires: expiresIn });
  Cookies.set("userId", userId, { expires: expiresIn });
  Cookies.set("firstName", firstName, { expires: expiresIn });
  Cookies.set("surName", surName, { expires: expiresIn });

  return {
    type: actions.AUTH_SUCCESS,
    token: token,
    userId: userId,
    firstName: firstName,
    surName: surName,
  };
};

const authFail = (errorType) => {
  console.log(errorType);
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
    case "Failed to fetch":
      errorMessage = "Unable to fetch data. No connection to database.";
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
  Cookies.expire("firstName");
  Cookies.expire("surName");
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

const authSQL = (
  url,
  idToken,
  expiresIn,
  localId,
  email,
  dispatch,
  firstName,
  surName
) => {
  const userData = {
    userGoogleId: localId,
    firstName: firstName,
    surName: surName,
    email: email,
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      const fname = response.firstName ? response.firstName : firstName;
      const sname = response.surName ? response.surName : surName;
      if (response.ok) {
        dispatch(authSuccess(idToken, localId, expiresIn, fname, sname));
      } else {
        return Promise.reject(response);
      }
    })
    .catch((response) => {
      dispatch(authFail(response.message));
    });
};

export const auth = (email, password, isToSignUp, firstName, surName) => {
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
        const idToken = response.idToken;
        const localId = response.localId;
        const expiresIn = response.expiresIn;

        if (isToSignUp) {
          authSQL(
            "http://192.168.0.157/rechat/php/Users/post.php",
            idToken,
            expiresIn,
            localId,
            email,
            dispatch,
            firstName,
            surName
          );
        } else {
          authSQL(
            "http://192.168.0.157/rechat/php/Users/fetch.php",
            idToken,
            expiresIn,
            localId,
            email,
            dispatch
          );
        }
      })
      .catch((response) => {
        response.json().then((json) => {
          dispatch(authFail(json.error.message));
        });
      });
  };
};

export const authCheckAuthToken = () => {
  return (dispatch) => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");
    const firstName = Cookies.get("firstName");
    const surName = Cookies.get("surName");

    if (
      token === undefined ||
      userId === undefined ||
      firstName === undefined ||
      surName === undefined
    ) {
      dispatch(authLogout());
      return;
    }

    dispatch(authSuccess(token, userId, null, firstName, surName));
  };
};
