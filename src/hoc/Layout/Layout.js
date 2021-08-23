import React, { Fragment } from "react";

function Layout({ children, ...props }) {
  return <Fragment>{children}</Fragment>;
}

export default Layout;
