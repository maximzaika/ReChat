import React, { Fragment, useEffect, useState } from "react";

export default function ChatAvatar({
  imgName,
  friendName,
  imgClass,
  textClass,
  userColor,
}) {
  let bgColors = [
    "bg-p-dark",
    "bg-yellow-400",
    "bg-green-400",
    "bg-indigo-400",
    "bg-pink-300",
  ];
  if (userColor) {
    bgColors = bgColors[userColor];
  } else {
    bgColors = "bg-p";
  }
  // const [indexBgColor, setIndexBgColor] = useState(null);
  //
  // useEffect(() => {
  //   setIndexBgColor(Math.floor(Math.random() * 5));
  // }, []);

  return (
    <Fragment>
      {imgName ? (
        <img
          className={imgClass + " object-cover object-center rounded-full"}
          src={require("../../../assets/images/" + imgName).default}
        />
      ) : (
        <div
          className={`rounded-full flex justify-center align-middle ${textClass} ${bgColors}`}
        >
          <h2 className="text-3xl text-white mt-auto mb-auto">
            {friendName[0].toUpperCase()}
          </h2>
        </div>
      )}
    </Fragment>
  );
}
