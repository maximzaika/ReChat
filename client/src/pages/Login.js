import { useEffect } from "react";

import AuthForm from "../components/Auth/AuthForm";
import * as actions from "../store/actions";
import { connect } from "react-redux";

function Login({ onAuth, isLoading, isError, onReset, ...props }) {
  const type = "login";

  useEffect(() => {
    onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthForm
      type={type}
      onAuth={onAuth}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
    isLoading: state.auth.loading,
    isError: state.auth.error,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAuth: (email, password, type) =>
      dispatch(actions.auth(email, password, type)),
    onReset: () => dispatch(actions.authReset()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
