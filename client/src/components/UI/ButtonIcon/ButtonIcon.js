import React from "react";
import PropTypes from "prop-types";
import "./ButtonIcon.css";

import Button from "../Button/Button";

export default function ButtonIcon({ children, clicked, type }) {
  return (
    <Button
      clicked={clicked}
      className="ButtonIcon flex space-x-4 items-center"
      marginPadding="px-4 py-1 ml-2"
      type={type}
    >
      {children}
    </Button>
  );
}

ButtonIcon.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["submit", "reset", "button", undefined]).isRequired,
  clicked: PropTypes.any,
};
