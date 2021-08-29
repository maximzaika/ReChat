import React from "react";
import PropTypes from "prop-types";
import "./LoadingIndicator.css";

export default function LoadingIndicator({
  show = false,
  showText,
  size = "",
  color = "",
  marginLeft = "",
  marginRight = "",
  marginTop = "",
  className = "",
}) {
  return (
    <>
      {show && (
        <>
          <div
            className={`${className} LoadingRing ${size} ${color} ${marginTop} ${marginLeft} ${marginRight}`}
          >
            <div />
            <div />
            <div />
            <div />
          </div>
          {showText && <p className="italic my-5">Loading...</p>}
        </>
      )}
    </>
  );
}

LoadingIndicator.propTypes = {
  size: PropTypes.oneOf(["Small", "Medium", undefined]),
  className: PropTypes.string,
  color: PropTypes.oneOf(["Light", "Dark", "White", undefined]),
  show: PropTypes.bool,
  marginLeft: PropTypes.string,
  marginTop: PropTypes.string,
  marginRight: PropTypes.string,
};
