import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import * as actions from "../store/actions";
import { toDecrypt, toEncrypt } from "../shared/aes";

import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import useFetchJson from "../hooks/useFetchJson";
import DivOverflowY from "../components/UI/DivOverflowY/DivOverflowY";
import TextArea from "../components/UI/TextArea/TextArea";
import IcoSendMessage from "../assets/ico/ico-send-message";
import ButtonIcon from "../components/UI/ButtonIcon/ButtonIcon";
import ChatAvatar from "../components/Pages/Chat/ChatAvatar";
import ChatUserMessages from "../components/Pages/Chat/ChatUserMessages";
import MyLink from "../components/UI/MyLink/MyLink";

import io from "socket.io-client";

const socket = io.connect("/");

function Chat({
  isAuth,
  authUserId,
  authUserFName,
  authUserSName,
  socketProcess,
}) {
  const [fetchedFriends, setFetchedFriends] = useFetchJson(
    "./json/friendList.json",
    ["inputMessage", "userColor"],
    isAuth
  );
  const fetchedUserMessages = useFetchJson(
    "./json/userMessages1.json",
    null,
    isAuth
  )[0];
  const [userMessages, setUserMessages] = useState([]);
  const [isActiveChat, setIsActiveChat] = useState(null);
  const [indexOfActiveChat, setIndexOfActiveChat] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (!isActiveChat) {
      const tempFriends = [...fetchedFriends];
      for (let friend of tempFriends) {
        friend["userColor"] = Math.floor(Math.random() * 5);
      }
    }
  }, [fetchedFriends, isActiveChat]);

  // temporary message id
  const [id, setId] = useState(1000);

  const onInputMessageHandler = (value) => {
    const tempUsers = [...fetchedFriends];
    tempUsers[indexOfActiveChat].inputMessage = value;
    setFetchedFriends(tempUsers);
  };

  const onSubmitMessageHandler = (
    event,
    message,
    uniqueId,
    senderId,
    recipientId
  ) => {
    if ((event.which !== 13 || event.shiftKey) && event.type !== "submit")
      return;

    event.preventDefault();
    const strippedMessage = message.split(" ").join("").split("\n").join("");
    if (!strippedMessage.length || !senderId || !recipientId) return;

    const messagePayload = {
      id: id,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: new Date().getTime(),
      message: message,
    };

    setUserMessages((prevState) => [messagePayload, ...prevState]);
    const encryptedMessage = toEncrypt(message);
    socket.emit("chat", encryptedMessage);

    // reset input form
    onInputMessageHandler("");

    //-----------temporary message id (must be handled by backend) -----------
    setId((prevState) => prevState + 1);
  };

  useEffect(() => {
    console.log(socket);
    socket.on("message", (data) => {
      console.log(socket);
      console.log(data);
    });
  }, [socket]);

  const onClickDisplayMessagesHandler = (userId, index, uniqueId) => {
    // if no users fetched or user's chat is already active
    // then avoid fetching / re-rendering again
    if (fetchedFriends.length < 0 || isActiveChat === userId || !uniqueId) {
      return;
    }

    console.log(userId);
    console.log(index);
    console.log(uniqueId);

    if (userId || userId !== "") {
      socket.emit("joinRoom", { username: userId, uniqueId: uniqueId });
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
    setIsActiveChat(userId);
    setIndexOfActiveChat(index);
    history.push("/chat/" + userId);
  };

  return (
    <div className="flex -mx-4">
      <div className="h-screen flex flex-col">
        <div className="flex flex-row gap-4 py-2 bg-gray-700 pl-2 pr-4">
          <ChatAvatar
            // imgName={fetchedFriends[indexOfActiveChat].avatar}
            friendName={authUserFName}
            imgClass="h-12 w-12"
            textClass="h-12 w-12"
          />
        </div>

        <DivOverflowY>
          <ul className="col-span-3 bg-black w-80">
            {fetchedFriends &&
              fetchedFriends.map((friend, index) => {
                // ensure that added friends are shown only (logically there should not be
                // friends that are not user's friends - handled on backend
                if (friend.userId !== authUserId) {
                  return null;
                }

                return (
                  <li
                    key={friend.id}
                    className={`px-4 cursor-pointer ${
                      isActiveChat === friend.id
                        ? "bg-gray-600 font-semibold"
                        : ""
                    } hover:bg-gray-700`}
                    onClick={() =>
                      onClickDisplayMessagesHandler(
                        friend.id,
                        index,
                        friend.uniqueId
                      )
                    }
                  >
                    <div className="flex py-2 gap-4">
                      <div className="flex-none">
                        <ChatAvatar
                          imgName={friend.avatar}
                          friendName={friend.name}
                          textClass="h-16 w-16"
                          imgClass="h-16 w-16"
                          userColor={friend.userColor}
                        />
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
                  </li>
                );
              })}
          </ul>
        </DivOverflowY>
      </div>

      <div className="flex flex-col h-screen w-full bg-gray-800 border-r-2 border-black">
        {indexOfActiveChat !== null && (
          <div className="flex flex-row gap-4 py-2 bg-gray-700 pl-2 pr-4">
            <ChatAvatar
              imgName={fetchedFriends[indexOfActiveChat].avatar}
              friendName={fetchedFriends[indexOfActiveChat].name}
              imgClass="h-12 w-12"
              textClass="h-12 w-12"
              userColor={fetchedFriends[indexOfActiveChat].userColor}
            />
            <div className="my-auto">
              <p className="m-0 font-semibold">
                {fetchedFriends[indexOfActiveChat].name}
              </p>
            </div>
          </div>
        )}

        <MyLink path={"/chat/" + "2"}>Go Next</MyLink>

        <ChatUserMessages
          isActiveChat={isActiveChat}
          messages={userMessages}
          authUserId={authUserId}
          setMessages={(messages) => setUserMessages(messages)}
        />

        {indexOfActiveChat !== null && (
          <form
            className="flex p-2"
            onSubmit={(event) =>
              onSubmitMessageHandler(
                event,
                fetchedFriends[indexOfActiveChat].inputMessage,
                fetchedFriends[indexOfActiveChat].uniqueId,
                authUserId,
                isActiveChat
              )
            }
          >
            <TextArea
              placeholder="Type a message"
              changed={(value) => onInputMessageHandler(value)}
              value={fetchedFriends[indexOfActiveChat].inputMessage}
              keyPressed={(event) =>
                onSubmitMessageHandler(
                  event,
                  fetchedFriends[indexOfActiveChat].inputMessage,
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

const mapDispatchToProps = (dispatch) => {
  return {
    socketProcess: (encrypt, msg, cipher) =>
      dispatch(actions.socketProcess(encrypt, msg, cipher)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
