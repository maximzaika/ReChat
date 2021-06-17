import React, { Suspense, lazy, Fragment, useEffect } from "react";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import Layout from "./hoc/Layout/Layout";
import LoadingIndicator from "./components/UI/LoadingIndicator/LoadingIndicator";
import * as actions from "./store/actions";

// Async/Lazy loaded Routes
const asyncHome = lazy(() => {
  return import("./pages/Home");
});

const asyncChat = lazy(() => {
  return import("./pages/Chat");
});

const asyncSignup = lazy(() => {
  return import("./pages/Signup");
});

const asyncLogin = lazy(() => {
  return import("./pages/Login");
});

const asyncChatUserMessages = lazy(() => {
  return import("./components/Pages/Chat/ChatUserMessages");
});

function App({ isAuthenticated, onTryAutoSignup, ...props }) {
  const loadingAnimation = (
    <div className="fixed left-1/2 -ml-10 top-1/2 -mt-10">
      <LoadingIndicator showText={true} />
    </div>
  );

  useEffect(() => {
    onTryAutoSignup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let routes = (
    <Switch>
      <Route path="/login" component={asyncLogin} />
      <Route path="/signup" component={asyncSignup} />
      <Route path="/" exact component={asyncHome} />
      <Redirect to="/login" />
    </Switch>
  );

  if (isAuthenticated) {
    routes = (
      <Switch>
        <Route path="/chat" component={asyncChat} />
        {/*<Route path="/chat:id" component={asyncChatUserMessages} />*/}
        <Route path="/" exact component={asyncHome} />
        <Redirect to="/" />
      </Switch>
    );
  }

  return (
    <Fragment>
      <Layout>
        <Suspense fallback={loadingAnimation}>{routes}</Suspense>
      </Layout>
    </Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
  };
};

const mapDispatchToProps = (dispatch) => {
  return { onTryAutoSignup: () => dispatch(actions.authCheckAuthToken()) };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
