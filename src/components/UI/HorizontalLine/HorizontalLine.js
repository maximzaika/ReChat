import React from "react";

export default function HorizontalLine({ color }) {
  const setColorClass = color ? color : "bg-p";
  return <div className={"h-px border-p w-full rounded " + setColorClass} />;
}
