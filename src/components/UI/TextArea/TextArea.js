import React from "react";

export default function TextArea({ placeholder, changed, value }) {
  const initialClass = "block w-full px-2 py-1.5";

  const onInputResize = (event) => {
    const target = event.target;
    const value = target.value;

    if (event.target.scrollHeight < 132) {
      // Resize the height of the textarea up until 132
      // also disable the scroll
      target.style.height = "inherit";
      target.style.height = `${event.target.scrollHeight}px`;
      target.style.overflowY = "hidden";
    } else {
      // Show overflow once it reached the desired height (more than 132)
      target.style.overflowY = "";
    }

    target.scrollTop = event.target.scrollHeight;
  };

  return (
    <textarea
      className={`${initialClass} resize-none overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500`}
      onChange={(event) => {
        onInputResize(event);
        changed(event.target.value);
      }}
      placeholder={placeholder}
      value={value}
      rows={1}
    />
  );
}
