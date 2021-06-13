import React from "react";

export default function OverflowY({ children }) {
  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden
                 scrollbar-thin scrollbar-track-gray-700
                 scrollbar-thumb-gray-500"
    >
      {children}
    </div>
  );
}
