import { useEffect } from "react";
import { connect } from "react-redux";

import AuthForm from "../components/Auth/AuthForm";
import * as actions from "../store/actions";

function Signup({ onAuth, isLoading, isError, onReset, ...props }) {
  const type = "signup";

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
    onAuth: (email, password, type, firstName, surName) =>
      dispatch(actions.auth(email, password, type, firstName, surName)),
    onReset: () => dispatch(actions.authReset()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
