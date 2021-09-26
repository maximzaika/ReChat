import React, { Fragment, useEffect } from "react";
import DivOverflowY from "../../UI/DivOverflowY/DivOverflowY";
import { toEncrypt, toDecrypt } from "../../../shared/aes";
import LoadingIndicator from "../../UI/LoadingIndicator/LoadingIndicator";
import { useDispatch } from "react-redux";

import { emitMessageDelete } from "../../../store/actions";

export default function ChatUserMessages({
  isActiveChat,
  messages,
  authUserId,
  setMessages,
  socket,
}) {
  const dispatch = useDispatch();

  const onHoverShowTime = (event, index) => {
    const eventType = event._reactName;
    const tempMessage = [...messages];

    if (eventType === "onMouseEnter") {
      tempMessage[index].showTime = true;
    } else if (eventType === "onMouseLeave" || !tempMessage[index].showTime) {
      tempMessage[index].showTime = false;
    }

    // setMessages(tempMessage);
  };

  return (
    <Fragment>
      {isActiveChat && messages && (
        <DivOverflowY className="flex flex-col-reverse pl-2 pr-4">
          {messages.map((message, index) => {
            const date = new Date(message.timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const time = `${hours}:${minutes}`;
            const incomingMessage = toDecrypt(message.message).split("\n");
            const deleteTimeframe =
              (new Date().getTime() - date.getTime()) / 3600000;

            // Sent messages are always on the right
            // while received messages are always on the left
            let customMessageClass = "bg-p-dark";
            if (message.recipientId === authUserId) {
              customMessageClass = "bg-gray-600";
            }

            let messageStatus = "sent";
            if (message.messageStatus === -1) {
              messageStatus = (
                <LoadingIndicator
                  show={message.messageStatus === -1}
                  size="Small"
                  color="White"
                  marginRight="mr-3"
                />
              );
            } else if (message.messageStatus === 0) {
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
                    <div key={i} className="flex space-x-2">
                      <p className="m-0">
                        {m.split(" ").join("") === "" ? "\u00a0\u00a0" : m}
                      </p>
                      {authUserId === message.senderId &&
                        message.messageStatus !== 3 &&
                        deleteTimeframe <= 1 && (
                          <span
                            onClick={() =>
                              dispatch(
                                emitMessageDelete(
                                  socket,
                                  message.id,
                                  message.timestamp
                                )
                              )
                            }
                          >
                            DEL
                          </span>
                        )}
                    </div>
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
