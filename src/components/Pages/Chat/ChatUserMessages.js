import React, { Fragment } from "react";
import DivOverflowY from "../../UI/DivOverflowY/DivOverflowY";

export default function ChatUserMessages({
  isActiveChat,
  messages,
  authUserId,
  setMessages,
}) {
  console.log("rendering");

  const onHoverShowTime = (event, index) => {
    const eventType = event._reactName;
    const tempMessage = [...messages];

    if (eventType === "onMouseEnter") {
      tempMessage[index].showTime = true;
    } else if (eventType === "onMouseLeave" || !tempMessage[index].showTime) {
      tempMessage[index].showTime = false;
    }

    setMessages(tempMessage);
  };

  return (
    <Fragment>
      {isActiveChat && (
        <DivOverflowY className="flex flex-col-reverse pl-2 pr-4">
          {messages.map((message, index) => {
            const date = new Date(message.timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const time = `${hours}:${minutes}`;
            const incomingMessage = message.message.split("\n");

            const allMessagesClass = "p-2 rounded max-w-sm";

            // Identify who is the sender and who is the receiver
            // Receiver is set by default
            let customMessageClass = "ml-auto bg-p-dark";
            if (message.senderId === authUserId) {
              customMessageClass = "bg-gray-600";
            }

            return (
              <div key={message.id} className="flex my-2">
                <span
                  className={`${allMessagesClass} ${customMessageClass} cursor-pointer fe`}
                  onMouseEnter={(event) => onHoverShowTime(event, index)}
                  onMouseLeave={(event) => onHoverShowTime(event, index)}
                >
                  {incomingMessage.map((m, i) => (
                    <p key={i} className="m-0">
                      {m.split(" ").join("") === "" ? "\u00a0\u00a0" : m}
                    </p>
                  ))}
                </span>
                {message.showTime && (
                  <span className="ml-2 text-sm italic">{time}</span>
                )}
              </div>
            );
          })}
        </DivOverflowY>
      )}
    </Fragment>
  );
}
