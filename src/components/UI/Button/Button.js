import React from "react";
import "./Button.css";

function Button({
  children,
  className,
  type, //Default (null), Light, Dark, White
  ariaLabel,
  clicked,
  isLoading,
  disabled,
  marginPadding,
}) {
  const disabledForced = disabled && !isLoading ? "disabled" : "";
  const customClass = className ? className : "";
  const disabledLoading = isLoading ? "loading" : "";
  const btnType = type === undefined ? "primary" : type;
  const customMarginPadding = marginPadding ? marginPadding : "py-2 px-6 my-4";

  return (
    <button
      className={`btn ${customMarginPadding} ${btnType} ${disabledForced} ${disabledLoading} ${customClass}`}
      onClick={clicked}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
