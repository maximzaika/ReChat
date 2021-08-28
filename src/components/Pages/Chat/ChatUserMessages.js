import React, { Fragment } from "react";
import DivOverflowY from "../../UI/DivOverflowY/DivOverflowY";

export default function ChatUserMessages({
  isActiveChat,
  messages,
  authUserId,
  setMessages,
}) {
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

            // Sent messages are always on the right
            // while received messages are always on the left
            let customMessageClass = "bg-p-dark";
            if (message.recipientId === authUserId) {
              customMessageClass = "bg-gray-600";
            }

            let messageStatus = "sent";
            if (message.messageStatus === 0) {
              messageStatus = "sent";
            } else if (message.messageStatus === 1) {
              messageStatus = "received";
            } else {
              // message.messageStatus = 2
              messageStatus = "seen";
            }

            return (
              <div key={message.id} className="flex my-2">
                {message.recipientId !== authUserId && (
                  <span className="ml-auto mr-3">{messageStatus}</span>
                )}

                <span
                  className={`p-2 rounded max-w-sm cursor-pointer ${customMessageClass}`}
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
