import React, { useState, useEffect, useRef } from "react";
import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import useFetchJson from "../hooks/useFetchJson";
import DivOverflowY from "../components/UI/DivOverflowY/DivOverflowY";
import TextArea from "../components/UI/TextArea/TextArea";
import IcoSendMessage from "../assets/ico/ico-send-message";
import ButtonIcon from "../components/UI/ButtonIcon/ButtonIcon";
import { connect } from "react-redux";

function Chat({ isAuth, authUserId, authUserFName, authUserSName }) {
  const [fetchedFriends, setFetchedFriends] = useFetchJson(
    "./json/friendList.json",
    "inputMessage",
    isAuth
  );
  const fetchedUserMessages = useFetchJson(
    "./json/userMessages1.json",
    null,
    isAuth
  )[0];
  const [userMessages, setUserMessages] = useState([]);
  const [isActiveChat, setIsisActiveChat] = useState(null);
  const [isIndexOfActiveChat, setIsIndexOfActiveChat] = useState(null);

  // temporary message id
  const [id, setId] = useState(1000);

  useEffect(() => {
    if (isActiveChat) {
      const index = fetchedFriends.findIndex(
        (user) => user.id === isActiveChat
      );
      setIsIndexOfActiveChat(index);
    }
  }, [isActiveChat]);

  const onInputMessageHandler = (value) => {
    const tempUsers = [...fetchedFriends];
    tempUsers[isIndexOfActiveChat].inputMessage = value;
    setFetchedFriends(tempUsers);
  };

  const onSubmitMessageHandler = (event, message, senderId, recipientId) => {
    if ((event.which !== 13 || event.shiftKey) && event.type !== "submit") {
      return;
    }

    event.preventDefault();

    const strippedMessage = message.split(" ").join("").split("\n").join("");

    if (!strippedMessage.length || !senderId || !recipientId) {
      return;
    }

    const messagePayload = {
      id: id,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: new Date().getTime(),
      message: message,
    };

    setUserMessages((prevState) => [messagePayload, ...prevState]);

    // reset input form to
    onInputMessageHandler("");

    //-----------temporary message id (must be handled by backend) -----------
    setId((prevState) => prevState + 1);
  };

  const onClickDisplayMessagesHandler = (userId) => {
    // if no users fetched or user's chat is already active\
    // then avoid fetching / re-rendering again
    if (fetchedFriends.length < 0 || isActiveChat === userId) {
      return;
    }

    // match clicked user with their message && ensure that
    // authenticated user receives their messages ONLY
    const messagesArr = [];
    for (let message of fetchedUserMessages) {
      if (
        (message.senderId === userId || message.recipientId === userId) &&
        (message.senderId === authUserId || message.recipientId === authUserId)
      ) {
        messagesArr.push(message);
      }
    }

    const sortedMessages = messagesArr.sort((a, b) =>
      a.timestamp > b.timestamp ? 1 : -1
    );

    setUserMessages(sortedMessages);
    setIsisActiveChat(userId);
  };

  const onHoverShowTime = (event, messageId) => {
    const eventType = event._reactName;
    const index = userMessages.findIndex((message) => message.id === messageId);
    const tempMessage = [...userMessages];

    if (eventType === "onMouseEnter") {
      tempMessage[index].showTime = true;
      setUserMessages(tempMessage);
    }

    if (eventType === "onMouseLeave" || !tempMessage[index].showTime) {
      tempMessage[index].showTime = false;
      setUserMessages(tempMessage);
    }
  };

  return (
    <div className="flex -mx-4">
      <DivOverflowY className="flex-none h-screen col-span-3 bg-black w-80">
        {fetchedFriends &&
          fetchedFriends.map((friend) => {
            // ensure that added friends are shown only (logically there should not be
            // friends that are not user's friends - handled on backend
            if (friend.userId !== authUserId) {
              return null;
            }

            return (
              <div
                key={friend.id}
                className={`px-4 cursor-pointer ${
                  isActiveChat === friend.id ? "bg-gray-600" : ""
                } hover:bg-gray-700`}
                onClick={() => onClickDisplayMessagesHandler(friend.id)}
              >
                <div className="flex py-2 gap-4">
                  <div className="flex-none">
                    {friend.avatar ? (
                      <img
                        className="object-cover object-center h-16 w-16 rounded-full"
                        src={
                          require("../assets/images/" + friend.avatar).default
                        }
                      />
                    ) : (
                      <div className="bg-gray-100 h-16 w-16 rounded-full flex justify-center align-middle">
                        <h2 className="text-p mt-auto mb-auto">
                          {friend.name[0].toUpperCase()}
                        </h2>
                      </div>
                    )}
                  </div>

                  <div className="w-52">
                    <div className="flex justify-between">
                      <p className="my-1">{friend.name}</p>
                      <p className="my-3 text-xs text-gray-400">
                        {friend.time}
                      </p>
                    </div>
                    <p className="my-0 truncate text-sm italic text-gray-400">
                      {friend.lastMessage}
                    </p>
                  </div>
                </div>

                <HorizontalLine color="bg-gray-700" />
              </div>
            );
          })}
      </DivOverflowY>

      <div className="flex flex-col h-screen w-full bg-gray-800 border-r-2 border-black">
        <DivOverflowY className="flex flex-col-reverse pl-2 pr-4">
          {userMessages.map((message) => {
            const allMessagesClass = "p-2 rounded max-w-sm";

            // Identify who is the sender and who is the receiver
            // Receiver is set by default
            let customMessageClass = "ml-auto bg-p-dark";
            if (message.senderId === authUserId) {
              customMessageClass = "bg-gray-600";
            }

            const date = new Date(message.timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const time = `${hours}:${minutes}`;

            let incomingMessage = message.message.split("\n");

            return (
              <div key={message.id} className="flex my-2">
                <span
                  className={`${allMessagesClass} ${customMessageClass} cursor-pointer fe`}
                  onMouseEnter={(event) => onHoverShowTime(event, message.id)}
                  onMouseLeave={(event) => onHoverShowTime(event, message.id)}
                >
                  {incomingMessage.map((m) => (
                    <p key={m}>{m}</p>
                  ))}
                </span>
                {message.showTime && (
                  <span className="ml-2 text-sm italic">{time}</span>
                )}
              </div>
            );
          })}
        </DivOverflowY>

        {isIndexOfActiveChat !== null && (
          <form
            className="flex p-2"
            onSubmit={(event) =>
              onSubmitMessageHandler(
                event,
                fetchedFriends[isIndexOfActiveChat].inputMessage,
                authUserId,
                isActiveChat
              )
            }
          >
            <TextArea
              placeholder="Type a message"
              changed={(value) => onInputMessageHandler(value)}
              value={fetchedFriends[isIndexOfActiveChat].inputMessage}
              keyPressed={(event) =>
                onSubmitMessageHandler(
                  event,
                  fetchedFriends[isIndexOfActiveChat].inputMessage,
                  authUserId,
                  isActiveChat
                )
              }
            />
            <ButtonIcon type="submit">
              <IcoSendMessage /> Send
            </ButtonIcon>
          </form>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isAuth: state.auth.token !== null,
    authUserId: state.auth.userId !== null ? state.auth.userId : null,
    authUserFName: state.auth.firstName !== null ? state.auth.firstName : null,
    authUserSName: state.auth.surName !== null ? state.auth.surName : null,
  };
};

export default connect(mapStateToProps, null)(Chat);
