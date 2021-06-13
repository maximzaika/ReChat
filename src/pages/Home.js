import { Fragment } from "react";
import { connect } from "react-redux";
import * as actions from "../store/actions";

import MyLink from "../components/UI/MyLink/MyLink";
import Button from "../components/UI/Button/Button";

function Home({ isAuthenticated, firstName, onLogoutClick }) {
  return (
    <div>
      <MyLink path="/chat">Chat</MyLink>
      <br />
      {isAuthenticated && (
        <Fragment>
          <p>Welcome back, {firstName}!</p>
          <Button clicked={onLogoutClick}>Logout</Button>
        </Fragment>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
    firstName: state.auth.firstName,
    surName: state.auth.surName,
  };
};

const mapDispatchToProps = (dispatch) => {
  return { onLogoutClick: () => dispatch(actions.authLogout()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
