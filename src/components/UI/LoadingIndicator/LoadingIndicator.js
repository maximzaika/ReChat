import { Fragment } from "react";
import "./LoadingIndicator.css";

export default function LoadingIndicator({
  show,
  showText,
  size,
  color,
  marginLeft,
  marginRight,
  marginTop,
  className,
  ...props
}) {
  const sizeClass = size ? size : "";
  const customClass = className ? className : "";
  const colorClass = color ? color : "";
  const showIndicator = show !== undefined ? show : true;
  const ml = marginLeft ? marginLeft : "";
  const mr = marginRight ? marginRight : "";
  const mt = marginTop ? marginTop : "";

  return (
    <Fragment>
      {showIndicator && (
        <Fragment>
          <div
            className={`${customClass} LoadingRing ${sizeClass} ${colorClass} ${mt} ${ml} ${mr}`}
          >
            <div />
            <div />
            <div />
            <div />
          </div>
          {showText && <p className="italic my-5">Loading...</p>}
        </Fragment>
      )}
    </Fragment>
  );
}
