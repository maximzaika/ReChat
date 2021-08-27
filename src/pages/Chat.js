import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import * as actions from "../store/actions";
import io from "socket.io-client";
import * as socketIoActions from "../shared/socketIoActionTypes";
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

const socket = io.connect("/");

function Chat({
  isAuth,
  authUserId,
  authUserFName,
  authUserSName,
  socketProcess,
}) {
  const dateFormat = require("dateformat");
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

    const encryptedMessage = toEncrypt(message);
    socket.emit(socketIoActions.sendMessage, {
      senderId: senderId,
      recipientId: recipientId,
      timestamp: new Date().getTime(),
      message: encryptedMessage,
    });

    // reset input form
    onInputMessageHandler("");
  };

  useEffect(() => {
    socket.on(
      socketIoActions.onlineStatus,
      ({ recipientId, socketId, userId, online, lastOnline }) => {
        if (recipientId !== authUserId) return;

        setFetchedFriends((prevState) => {
          const users = [...prevState];
          const index = users.findIndex((user) => user.id === userId);
          users[index].onlineState = online;
          users[index].lastOnline = dateFormat(lastOnline, "isoDateTime");
          return users;
        });
      }
    );

    socket.on(
      socketIoActions.message,
      ({ senderId, recipientId, timestamp, message }) => {
        const decryptedMessage = toDecrypt(message);
        const date = new Date();

        setFetchedFriends((prevState) => {
          const _fetchedFriends = [...prevState];
          let indexSender = -1;
          if (senderId === authUserId) {
            indexSender = _fetchedFriends.findIndex(
              (user) => senderId === user.userId
            );
          } else {
            indexSender = _fetchedFriends.findIndex(
              (user) => senderId === user.id
            );
          }

          if (indexSender === -1) return [...prevState];
          _fetchedFriends[indexSender].lastMessage = decryptedMessage;
          _fetchedFriends[indexSender].time = dateFormat(date, "isoDateTime");
          return _fetchedFriends;
        });

        setUserMessages((prevState) => [
          {
            senderId: senderId,
            recipientId: recipientId,
            timestamp: timestamp,
            message: decryptedMessage,
          },
          ...prevState,
        ]);
      }
    );
  }, [socket]);

  useEffect(() => {
    console.log(fetchedFriends);
  }, [fetchedFriends]);

  console.log(indexOfActiveChat);

  const onClickDisplayMessagesHandler = (recipientId, index, uniqueId) => {
    // if no users fetched or user's chat is already active
    // then avoid fetching / re-rendering again
    if (fetchedFriends.length < 0 || isActiveChat === recipientId || !uniqueId)
      return;

    if (recipientId || recipientId !== "") {
      socket.emit(socketIoActions.joinRoom, {
        userId: authUserId,
        recipientId: recipientId,
        roomId: uniqueId,
      });

      if (isActiveChat) {
        socket.emit(socketIoActions.disconnectRoom);
      }
    }

    // match clicked user with their message && ensure that
    // authenticated user receives their messages ONLY
    const messagesArr = [];
    for (let message of fetchedUserMessages) {
      if (
        (message.senderId === recipientId ||
          message.recipientId === recipientId) &&
        (message.senderId === authUserId || message.recipientId === authUserId)
      ) {
        messagesArr.push(message);
      }
    }

    const sortedMessages = messagesArr.sort((a, b) =>
      a.timestamp > b.timestamp ? 1 : -1
    );

    setUserMessages(sortedMessages);
    setIsActiveChat(recipientId);
    setIndexOfActiveChat(index);
    history.push("/chat/" + recipientId);
  };

  const getTime = (time, prefix = false) => {
    const timeCurrent = new Date().getTime();
    const timeReceived = new Date(time).getTime();
    const differenceInTime = timeReceived - timeCurrent;
    const differenceInDays = Math.floor(
      Math.abs(differenceInTime / (1000 * 3600 * 24))
    );
    const postfix = prefix ? ` at ${dateFormat(time, "HH:M")}` : "";
    let _prefix = prefix ? "on " : "";

    if (differenceInDays === 0) {
      _prefix = prefix ? "today at " : "";
      return _prefix + dateFormat(time, "HH:M");
    } else if (differenceInDays === 1) {
      _prefix = prefix ? "" : "";
      return _prefix + "yesterday" + postfix;
    } else if (differenceInDays <= 7 && differenceInDays > 1) {
      // const dayOfTheWeek = prefix ? "dddd" : "ddd";
      return _prefix + dateFormat(time, "dddd") + postfix;
    } else {
      return _prefix + dateFormat(time, "dd/mm/yyyy") + postfix;
    }
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

                const {
                  id,
                  userId,
                  uniqueId,
                  avatar,
                  name,
                  lastMessage,
                  time,
                  userColor,
                } = friend;

                return (
                  <li
                    key={id}
                    className={`px-4 cursor-pointer ${
                      isActiveChat === id ? "bg-gray-600 font-semibold" : ""
                    } hover:bg-gray-700`}
                    onClick={() =>
                      onClickDisplayMessagesHandler(id, index, uniqueId)
                    }
                  >
                    <div className="flex py-2 gap-4">
                      <div className="flex-none">
                        <ChatAvatar
                          imgName={avatar}
                          friendName={name}
                          textClass="h-14 w-14"
                          imgClass="h-14 w-14"
                          userColor={userColor}
                        />
                      </div>

                      <div className="flex flex-col justify-around w-52">
                        <div className="flex justify-between">
                          <span className="truncate">{name}</span>
                          <span className="text-xs text-gray-400">
                            {getTime(time)}
                          </span>
                        </div>
                        <p className="my-0 truncate text-sm italic text-gray-400">
                          {lastMessage}
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
            <div className="flex flex-col justify-center">
              <h1 className="m-0 font-semibold text-base my-0">
                {fetchedFriends[indexOfActiveChat].name}
              </h1>
              <h2 className="italic font-normal text-sm my-0">
                {/*{connectedUsers.find(*/}
                {/*  (user) => user.userId === fetchedFriends[indexOfActiveChat].id*/}
                {/*)*/}
                {/*  ? "Online now"*/}
                {/*  : "Last seen - August 24th at 17:03"}*/}

                {fetchedFriends[indexOfActiveChat].onlineState
                  ? "Online now"
                  : `Last seen ${getTime(
                      fetchedFriends[indexOfActiveChat].lastOnline,
                      true
                    )}`}
              </h2>
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
                  fetchedFriends[indexOfActiveChat].uniqueId,
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
