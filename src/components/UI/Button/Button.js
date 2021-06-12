import "./Button.css";

function Button({
  children,
  className,
  type, //Default (null), Light, Dark, White
  ariaLabel,
  clicked,
  isLoading,
  disabled,
}) {
  const disabledForced = disabled && !isLoading ? "disabled" : "";
  const customClass = className ? className : "";
  const disabledLoading = isLoading ? "temp-disabled" : "";
  const btnType = type === undefined ? "primary" : type;

  return (
    <button
      className={`btn ${btnType} ${customClass} ${disabledForced} ${disabledLoading}`}
      onClick={clicked}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
