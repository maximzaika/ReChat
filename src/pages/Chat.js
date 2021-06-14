import React, { Fragment, useState, useEffect, useRef } from "react";
import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import useFetchJson from "../hooks/useFetchJson";
import OverflowY from "../components/UI/OverflowY/OverflowY";
import TextArea from "../components/UI/TextArea/TextArea";
import IcoSendMessage from "../assets/ico/ico-send-message";
import Button from "../components/UI/Button/Button";
import ButtonIcon from "../components/UI/ButtonIcon/ButtonIcon";

function Chat() {
  const [users, setUsers] = useFetchJson("./json/users.json", "inputMessage");
  const userMessages = useFetchJson("./json/userMessages.json")[0];
  const [messages, setMessages] = useState([]);

  const [activeChat, setActiveChat] = useState(null);
  const [indexActiveChat, setIndexActiveChat] = useState(null);
  const refScroll = useRef(null);

  useEffect(() => {
    if (activeChat) {
      const index = users.findIndex((user) => user.id === activeChat);
      setIndexActiveChat(index);
    }
  }, [activeChat]);

  const onInputMessageHandler = (value) => {
    const tempUsers = [...users];
    tempUsers[indexActiveChat].inputMessage = value;
    setUsers(tempUsers);
  };

  const onClickDisplayMessagesHandler = (userId) => {
    if (users.length < 0 || activeChat === userId) {
      return;
    }

    const messagesArr = [];

    for (let message of userMessages) {
      if (message.userId === userId) {
        messagesArr.push({
          id: message.id,
          message: message.message,
          time: message.time,
          type: message.type,
          showTime: false,
        });
      }
    }

    const sortedMessages = messagesArr.sort((a, b) =>
      a.time > b.time ? 1 : -1
    );

    setMessages(sortedMessages);
    setActiveChat(userId);
  };

  const onHoverShowTime = (event, messageId) => {
    const eventType = event._reactName;
    const index = messages.findIndex((message) => message.id === messageId);
    const tempMessage = [...messages];

    if (eventType === "onMouseEnter") {
      tempMessage[index].showTime = true;
      setMessages(tempMessage);
    }

    if (eventType === "onMouseLeave" || !tempMessage[index].showTime) {
      tempMessage[index].showTime = false;
      setMessages(tempMessage);
    }
  };

  return (
    <div className="flex -mx-4">
      <div
        className="flex-none h-screen col-span-3 bg-black
                      w-80"
      >
        <OverflowY>
          {users &&
            users.map((user) => {
              return (
                <div
                  key={user.id}
                  className={`px-4 cursor-pointer ${
                    activeChat === user.id ? "bg-gray-600" : ""
                  } hover:bg-gray-700`}
                  onClick={() => onClickDisplayMessagesHandler(user.id)}
                >
                  <div className="flex py-2 gap-4">
                    <div className="flex-none">
                      {user.avatar ? (
                        <img
                          className="object-cover object-center h-16 w-16 rounded-full"
                          src={
                            require("../assets/images/" + user.avatar).default
                          }
                        />
                      ) : (
                        <div className="bg-gray-100 h-16 w-16 rounded-full flex justify-center align-middle">
                          <h2 className="text-p mt-auto mb-auto">
                            {user.name[0].toUpperCase()}
                          </h2>
                        </div>
                      )}
                    </div>

                    <div className="w-52">
                      <div className="flex justify-between">
                        <p className="my-1">{user.name}</p>
                        <p className="my-3 text-xs text-gray-400">
                          {user.time}
                        </p>
                      </div>
                      <p className="my-0 truncate text-sm italic text-gray-400">
                        {user.lastMessage}
                      </p>
                    </div>
                  </div>

                  <HorizontalLine />
                </div>
              );
            })}
        </OverflowY>
      </div>

      <div className="flex flex-col h-screen w-full bg-gray-800 border-r-2 border-black">
        <OverflowY
          getRef={refScroll}
          className="flex flex-col-reverse pl-2 pr-4"
        >
          {messages.map((message) => {
            const allMessagesClass = "p-2 rounded max-w-sm";
            let customMessageClass =
              message.type === 1 ? "bg-gray-600" : "ml-auto bg-p-dark";

            const date = new Date(message.time);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const time = `${hours}:${minutes}`;

            return (
              <div key={message.id} className="flex my-2">
                <span
                  className={`${allMessagesClass} ${customMessageClass} cursor-pointer fe`}
                  onMouseEnter={(event) => onHoverShowTime(event, message.id)}
                  onMouseLeave={(event) => onHoverShowTime(event, message.id)}
                >
                  {message.message}
                </span>
                {message.showTime && (
                  <span className="ml-2 text-sm italic">{time}</span>
                )}
              </div>
            );
          })}
        </OverflowY>
        {indexActiveChat !== null && (
          <form className="flex p-2">
            <TextArea
              placeholder="Type a message"
              changed={(value) => onInputMessageHandler(value)}
              value={users[indexActiveChat].inputMessage}
            />
            <ButtonIcon>
              <IcoSendMessage /> Send
            </ButtonIcon>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
