import { connect } from "react-redux";
import * as actions from "../store/actions";

import MyLink from "../components/UI/MyLink/MyLink";
import Button from "../components/UI/Button/Button";

function Home({ isAuthenticated, onLogoutClick }) {
  return (
    <div>
      <MyLink path="/chat">Chat</MyLink>
      <br />
      {isAuthenticated && <Button clicked={onLogoutClick}>Logout</Button>}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
  };
};

const mapDispatchToProps = (dispatch) => {
  return { onLogoutClick: () => dispatch(actions.authLogout()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
