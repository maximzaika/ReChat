import React from "react";
import PropTypes from "prop-types";
import "./Button.css";

export default function Button({
  type,
  children,
  className = "",
  marginPadding = "py-2 px-6 my-4",
  color = "primary",
  ariaLabel,
  isLoading,
  clicked,
  disabled,
}) {
  const disabledForced = disabled && !isLoading ? "disabled" : "";
  const whileLoading = isLoading ? "loading" : "";

  return (
    <button
      className={`btn ${marginPadding} ${color} ${disabledForced} ${whileLoading} ${className}`}
      onClick={clicked}
      aria-label={ariaLabel}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["submit", "reset", "button", undefined]).isRequired,
  clicked: PropTypes.any,
  marginPadding: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  isLoading: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "Light", "Dark", "White", undefined]),
  disabled: PropTypes.bool,
};
