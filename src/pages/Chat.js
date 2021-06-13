import React, { Fragment, useState } from "react";
import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import useFetchJson from "../hooks/useFetchJson";
import OverflowY from "../components/UI/OverflowY/OverflowY";

function Chat() {
  const { users } = useFetchJson("./json/users.json");
  const { userMessages } = useFetchJson("./json/userMessages.json");
  const [messages, setMessages] = useState([]);

  const fetchUserMessages = (userId) => {
    if (users.length < 0) {
      return;
    }

    const messagesArr = [];

    for (let message of userMessages) {
      if (message.userId === userId) {
        messagesArr.push({
          id: message.id,
          message: message.message,
          time: message.time,
          from: message.from,
        });
      }
    }

    const sortedMessages = messagesArr.sort((a, b) =>
      a.time < b.time ? 1 : -1
    );

    console.log(sortedMessages);

    setMessages(sortedMessages);
  };
  // const date = new Date();
  // const ms = date.getTime();
  // console.log(ms);
  //
  // const fullDate = new Date(ms).toString();
  // console.log(fullDate);

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
                  className="px-4 cursor-pointer hover:bg-gray-700"
                  onClick={() => fetchUserMessages(user.id)}
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

      <div className="h-screen w-screen">
        {messages.map((message) => {
          let msg = "";
          if (message.from === 1) {
            msg = (
              <p key={message.id} className="text-p">
                {message.message}
              </p>
            );
          } else {
            msg = <p key={message.id}>{message.message}</p>;
          }

          return msg;
        })}
      </div>
    </div>
  );
}

export default Chat;
