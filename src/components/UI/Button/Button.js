import React from "react";
import "./Button.css";

function Button({
  children,
  className,
  color, //Default (null), Light, Dark, White
  type,
  ariaLabel,
  clicked,
  isLoading,
  disabled,
  marginPadding,
}) {
  const disabledForced = disabled && !isLoading ? "disabled" : "";
  const customClass = className ? className : "";
  const disabledLoading = isLoading ? "loading" : "";
  const btnColor = color === undefined ? "primary" : color;
  const customMarginPadding = marginPadding ? marginPadding : "py-2 px-6 my-4";

  return (
    <button
      className={`btn ${customMarginPadding} ${btnColor} ${disabledForced} ${disabledLoading} ${customClass}`}
      onClick={clicked}
      aria-label={ariaLabel}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;
