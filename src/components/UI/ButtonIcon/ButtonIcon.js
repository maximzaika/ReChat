import React from "react";

import "./ButtonIcon.css";
import Button from "../Button/Button";

export default function ButtonIcon({ children, clicked, type }) {
  return (
    <Button
      clicked={clicked}
      className="ButtonIcon flex gap-2 items-center"
      marginPadding="px-4 py-1 ml-2"
      type={type}
    >
      {children}
    </Button>
  );
}
