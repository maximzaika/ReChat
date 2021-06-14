import React from "react";

export default function OverflowY({ children, getRef, className }) {
  const classes =
    `${className} h-full overflow-y-auto overflow-x-hidden ` +
    `scrollbar-thin scrollbar-track-gray-700 ` +
    `scrollbar-thumb-gray-500`;
  return (
    <div className={classes} ref={getRef}>
      {children}
    </div>
  );
}
