import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import * as actions from "../store/actions";
import io from "socket.io-client";
import * as socketIoActions from "../shared/socketIoActionTypes";
import { toDecrypt, toEncrypt } from "../shared/aes";
import { v4 as uuid } from "uuid";

import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import useFetch from "../hooks/useFetchJson";
import DivOverflowY from "../components/UI/DivOverflowY/DivOverflowY";
import TextArea from "../components/UI/TextArea/TextArea";
import IcoSendMessage from "../assets/ico/ico-send-message";
import ButtonIcon from "../components/UI/ButtonIcon/ButtonIcon";
import ChatAvatar from "../components/Pages/Chat/ChatAvatar";
import ChatUserMessages from "../components/Pages/Chat/ChatUserMessages";
import MyLink from "../components/UI/MyLink/MyLink";
import { showChat } from "../store/actions";

const socket = io.connect("/");

function Chat({
  isAuth,
  authUserId,
  authUserFName,
  authUserSName,
  fetchData,
  messageInput,
  showChat,
  setActiveChat,
  friends,
  messages,
  isActiveChat,
  indexOfActiveChat,
  emitConnectUser,
  emitDisconnectUser,
  emitMessage,
  emitUserTyping,
  emitMsgSeen,
  onOnlineStateChange,
  onTypingStateChange,
  onNewMessage,
  onMessageSent,
  onMessageState,
}) {
  useEffect(() => {
    fetchData(isAuth, { userId: authUserId });
  }, [fetchData]);

  const dateFormat = require("dateformat");
  // const [fetchedFriends, setFetchedFriends] = useFetch(
  //   "/friendList",
  //   ["inputMessage", "userColor"],
  //   isAuth,
  //   { userId: authUserId }
  // );
  // const [fetchedUserMessages, setFetchedUserMessages] = useFetch(
  //   "/messages",
  //   null,
  //   isAuth,
  //   {
  //     userId: authUserId,
  //   }
  // );

  // const [isActiveChat, setIsActiveChat] = useState(null);
  // const [indexOfActiveChat, setIndexOfActiveChat] = useState(null);
  const history = useHistory();

  // const _isActiveChat = useRef(isActiveChat);
  //
  // useEffect(() => {
  //   _isActiveChat.current = isActiveChat;
  // }, [isActiveChat]);

  // /** added */
  // useEffect(() => {
  //   if (!isActiveChat) {
  //     const tempFriends = [...fetchedFriends];
  //     for (let friend of tempFriends) {
  //       friend["userColor"] = Math.floor(Math.random() * 5);
  //     }
  //   }
  // }, [fetchedFriends, isActiveChat]);

  /** ADDED */
  const onInputMessageHandler = (value) => {
    messageInput(socket, value);
    // const tempUsers = [...fetchedFriends];
    // tempUsers[indexOfActiveChat].inputMessage = value;
    //
    // // Set typing status on the sender client side to prevent
    // // posting "sending status" to the socket on each key press
    // if (tempUsers[indexOfActiveChat].userTyping === undefined) {
    //   tempUsers[indexOfActiveChat].userTyping = false;
    // }
    //
    // // notify another user that current user is not typing
    // if (value.length === 0 && tempUsers[indexOfActiveChat].userTyping) {
    //   tempUsers[indexOfActiveChat].userTyping = false;
    //   // emitUserTyping(
    //   //   socket,
    //   //   false,
    //   //   tempUsers[indexOfActiveChat].uniqueId,
    //   //   authUserId
    //   // );
    // }
    //
    // // notify another user that current user is typing
    // if (value.length > 0 && !tempUsers[indexOfActiveChat].userTyping) {
    //   tempUsers[indexOfActiveChat].userTyping = true;
    //   // emitUserTyping(
    //   //   socket,
    //   //   true,
    //   //   tempUsers[indexOfActiveChat].uniqueId,
    //   //   authUserId
    //   // );
    // }
    //
    // setFetchedFriends(tempUsers);
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

    emitMessage(socket, senderId, recipientId, uniqueId, message);

    // /** ADDED */
    // const temporaryId = uuid();
    // const timestamp = dateFormat(new Date(), "isoDateTime");
    // const encryptedMessage = toEncrypt(message);
    //
    // /** ADDED */
    // setFetchedUserMessages((prevState) => {
    //   const currentMessages = { ...prevState };
    //   currentMessages[recipientId] = [
    //     {
    //       id: temporaryId,
    //       senderId: senderId,
    //       recipientId: recipientId,
    //       timestamp: timestamp,
    //       message: encryptedMessage,
    //       messageStatus: -1,
    //     },
    //     ...currentMessages[recipientId],
    //   ];
    //   return currentMessages;
    // });
    //
    // /** ADDED */
    // setFetchedFriends((prevState) => {
    //   const _fetchedFriends = [...prevState];
    //   let indexSender = -1;
    //   if (senderId === authUserId) {
    //     indexSender = _fetchedFriends.findIndex(
    //       (user) => senderId === user.userId
    //     );
    //   } else {
    //     indexSender = _fetchedFriends.findIndex((user) => senderId === user.id);
    //   }
    //
    //   if (indexSender === -1) return [...prevState];
    //   _fetchedFriends[indexSender].lastMessage = encryptedMessage;
    //   _fetchedFriends[indexSender].time = timestamp;
    //   return _fetchedFriends;
    // });

    // reset input form
    // onInputMessageHandler("");
  };

  useEffect(() => {
    /** added */
    socket.on(
      socketIoActions.onlineStatus,
      ({ recipientId, socketId, userId, online, lastOnline }) => {
        onOnlineStateChange(recipientId, userId, online, lastOnline);

        // if (recipientId !== authUserId) return;
        //
        // setFetchedFriends((prevState) => {
        //   const users = [...prevState];
        //   const index = users.findIndex((user) => user.id === userId);
        //   users[index].onlineState = online;
        //   users[index].lastOnline = dateFormat(lastOnline, "isoDateTime");
        //   return users;
        // });
      }
    );

    /** added */
    socket.on(
      socketIoActions.typingState,
      ({ recipientId, userId, typingState }) => {
        onTypingStateChange(recipientId, userId, typingState);

        // if (recipientId !== authUserId) return;
        //
        // setFetchedFriends((prevState) => {
        //   const users = [...prevState];
        //   const index = users.findIndex((user) => user.id === userId);
        //   users[index].typingState = typingState;
        //   return users;
        // });
      }
    );

    /** added */
    socket.on(
      socketIoActions.message,
      ({ id, senderId, recipientId, timestamp, message, messageStatus }) => {
        emitMsgSeen(socket, id, senderId, recipientId);
        onNewMessage(socket, id, senderId, recipientId, timestamp, message);

        // setFetchedFriends((prevState) => {
        //   const _fetchedFriends = [...prevState];
        //   let indexSender = -1;
        //   if (senderId === authUserId) {
        //     indexSender = _fetchedFriends.findIndex(
        //       (user) => senderId === user.userId
        //     );
        //   } else {
        //     indexSender = _fetchedFriends.findIndex(
        //       (user) => senderId === user.id
        //     );
        //   }
        //
        //   if (indexSender === -1) return [...prevState];
        //   _fetchedFriends[indexSender].lastMessage = message;
        //   _fetchedFriends[indexSender].time = timestamp;
        //
        //   // sort users with new messages to the top of the friend list
        //   _fetchedFriends.sort((a, b) => new Date(b.time) - new Date(a.time));
        //
        //   // if chat is active, then need to keep track of the new index after the sort
        //   // to ensure that it doesn't get closed
        //   if (_isActiveChat.current) {
        //     const newActiveUser = _fetchedFriends.findIndex(
        //       (user) => user.id === _isActiveChat.current
        //     );
        //     setIndexOfActiveChat(newActiveUser);
        //   }
        //
        //   return _fetchedFriends;
        // });
        //
        // setFetchedUserMessages((prevState) => {
        //   const currentMessages = { ...prevState };
        //   let user = senderId === authUserId ? recipientId : senderId;
        //   currentMessages[user] = [
        //     {
        //       id: id,
        //       senderId: senderId,
        //       recipientId: recipientId,
        //       timestamp: timestamp,
        //       message: message,
        //       messageStatus: -1,
        //     },
        //     ...currentMessages[user],
        //   ];
        //   return currentMessages;
        // });

        // // if message is received by another client then
        // // notify the server (only if another friend's chat
        // // is active
        // if (_isActiveChat.current === senderId) return;
        // emitMsgReceived(socket, authUserId, senderId);
      }
    );

    /** ADDED */
    socket.on(
      socketIoActions.messageSent,
      ({ temporaryMessageId, newMessageId, userId, recipientId }) => {
        onMessageSent(temporaryMessageId, newMessageId, userId, recipientId);

        // if (userId !== authUserId) return;
        //
        // setFetchedUserMessages((prevState) => {
        //   const currentMessages = { ...prevState };
        //   let _userId = userId === authUserId ? recipientId : userId;
        //
        //   const index = currentMessages[_userId].findIndex(
        //     (message) => message.id === temporaryMessageId
        //   );
        //   if (index > -1) {
        //     console.log("updating id and message status");
        //     currentMessages[_userId][index].id = newMessageId;
        //     currentMessages[_userId][index].messageStatus = 0;
        //   }
        //   return currentMessages;
        // });
      }
    );

    /** added */
    socket.on(
      socketIoActions.messageReceived,
      ({ messagesId, userId, recipientId }) => {
        onMessageState(messagesId, userId, recipientId, 1);
        // if (userId !== authUserId) return;
        //
        // setFetchedUserMessages((prevState) => {
        //   const currentMessages = { ...prevState };
        //   let _userId = userId === authUserId ? recipientId : userId;
        //
        //   // console.log("userId", userId);
        //   // console.log("authUserId", authUserId);
        //   // console.log("recipientId", recipientId);
        //   // console.log("messagesId", messagesId);
        //
        //   for (let messageId of messagesId) {
        //     const index = currentMessages[_userId].findIndex(
        //       (message) => message.id === messageId
        //     );
        //     // console.log("messageId");
        //     // console.log("index", index);
        //     if (index > -1) {
        //       // console.log("received", messageId);
        //       currentMessages[_userId][index].messageStatus = 1;
        //     }
        //   }
        //   return currentMessages;
        // });
      }
    );

    /** added */
    socket.on(
      socketIoActions.messageSeen,
      ({ messagesId, userId, recipientId }) => {
        onMessageState(messagesId, userId, recipientId, 2);

        // if (userId !== authUserId) return;
        // setFetchedUserMessages((prevState) => {
        //   const currentMessages = { ...prevState };
        //   let _userId = userId === authUserId ? recipientId : userId;
        //
        //   for (let messageId of messagesId) {
        //     const index = currentMessages[_userId].findIndex(
        //       (message) => message.id === messageId
        //     );
        //     if (index > -1) currentMessages[_userId][index].messageStatus = 2;
        //   }
        //   return currentMessages;
        // });
      }
    );
  }, [
    emitMsgSeen,
    onMessageSent,
    onMessageState,
    onNewMessage,
    onOnlineStateChange,
    onTypingStateChange,
  ]);

  // useEffect(() => {
  //   // console.log(fetchedFriends);
  // }, [fetchedFriends]);

  const onClickDisplayMessagesHandler = (recipientId, index, uniqueId) => {
    // if no users fetched or user's chat is already active
    // then avoid fetching / re-rendering again
    console.log(isActiveChat);

    showChat(socket, recipientId, index, uniqueId);

    // if (friends.length < 0 || isActiveChat === recipientId || !uniqueId) return;
    //
    // if (recipientId || recipientId !== "") {
    //   emitConnectUser(socket, authUserId, recipientId, uniqueId);
    //   if (isActiveChat) emitDisconnectUser(socket);
    // }
    //
    // let _fetchedMessages = { ...messages };
    // // let userMessages = [];
    // if (!(recipientId in _fetchedMessages)) {
    //   _fetchedMessages = { ...messages, [recipientId]: [] };
    // }
    //
    // // setFetchedUserMessages(_fetchedMessages);
    // setActiveChat(recipientId, index);
    // // setIsActiveChat(recipientId);
    // // setIndexOfActiveChat(index);
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
            friendName={authUserFName}
            imgClass="h-12 w-12"
            textClass="h-12 w-12"
          />
        </div>

        <DivOverflowY>
          <ul className="col-span-3 bg-black w-80">
            {friends.length &&
              friends.map((friend, index) => {
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
                          {toDecrypt(lastMessage)}
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
              imgName={friends[indexOfActiveChat].avatar}
              friendName={friends[indexOfActiveChat].name}
              imgClass="h-12 w-12"
              textClass="h-12 w-12"
              userColor={friends[indexOfActiveChat].userColor}
            />
            <div className="flex flex-col justify-center">
              <h1 className="m-0 font-semibold text-base my-0">
                {friends[indexOfActiveChat].name}
              </h1>
              <h2 className="italic font-normal text-sm my-0">
                {friends[indexOfActiveChat].typingState &&
                friends[indexOfActiveChat].onlineState
                  ? "Typing..."
                  : !friends[indexOfActiveChat].typingState &&
                    friends[indexOfActiveChat].onlineState
                  ? "Online now"
                  : `Last seen ${getTime(
                      friends[indexOfActiveChat].lastOnline,
                      true
                    )}`}
              </h2>
            </div>
          </div>
        )}

        <MyLink path={"/chat/" + "2"}>Go Next</MyLink>

        <ChatUserMessages
          isActiveChat={isActiveChat}
          messages={messages[isActiveChat]}
          authUserId={authUserId}
          setMessages={(messages) => {}}
        />

        {indexOfActiveChat !== null && (
          <form
            className="flex p-2"
            onSubmit={(event) =>
              onSubmitMessageHandler(
                event,
                friends[indexOfActiveChat].inputMessage,
                friends[indexOfActiveChat].uniqueId,
                authUserId,
                isActiveChat
              )
            }
          >
            <TextArea
              placeholder="Type a message"
              changed={(value) => onInputMessageHandler(value)}
              value={friends[indexOfActiveChat].inputMessage}
              keyPressed={(event) =>
                onSubmitMessageHandler(
                  event,
                  friends[indexOfActiveChat].inputMessage,
                  friends[indexOfActiveChat].uniqueId,
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
    friends: state.socket.friends,
    messages: state.socket.messages,
    isActiveChat: state.socket.isActiveChat.friendId,
    indexOfActiveChat: state.socket.isActiveChat.index,
    isAuth: state.auth.token !== null,
    authUserId: state.auth.userId !== null ? state.auth.userId : null,
    authUserFName: state.auth.firstName !== null ? state.auth.firstName : null,
    authUserSName: state.auth.surName !== null ? state.auth.surName : null,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (isAuth, friends) =>
      dispatch(actions.fetchData(isAuth, friends)),
    messageInput: (socket, value) =>
      dispatch(actions.messageInput(socket, value)),
    setActiveChat: (friendId, index) =>
      dispatch(actions.setActiveChat(friendId, index)),
    showChat: (socket, friendId, index, uniqueId) =>
      dispatch(actions.showChat(socket, friendId, index, uniqueId)),
    emitConnectUser: (socket, userId, recipientId, roomId) =>
      dispatch(actions.emitConnectUser(socket, userId, recipientId, roomId)),
    emitDisconnectUser: (socket) =>
      dispatch(actions.emitDisconnectUser(socket)),
    emitMessage: (
      socket,
      tempId,
      senderId,
      recipientId,
      roomId,
      timestamp,
      message
    ) =>
      dispatch(
        actions.emitMessage(
          socket,
          tempId,
          senderId,
          recipientId,
          roomId,
          timestamp,
          message
        )
      ),
    emitUserTyping: (socket, isTyping, roomId, senderId) =>
      dispatch(actions.emitUserTypingState(socket, isTyping, roomId, senderId)),
    emitMsgSeen: (socket, messageId, senderId, recipientId) =>
      dispatch(
        actions.emitMessageSeenState(socket, messageId, senderId, recipientId)
      ),
    onOnlineStateChange: (recipientId, userId, online, lastOnline) =>
      dispatch(
        actions.onOnlineStateChange(recipientId, userId, online, lastOnline)
      ),
    onTypingStateChange: (recipientId, userId, typingState) =>
      dispatch(actions.onTypingStateChange(recipientId, userId, typingState)),
    onNewMessage: (
      socket,
      messageId,
      senderId,
      recipientId,
      timestamp,
      message
    ) =>
      dispatch(
        actions.onNewMessage(
          socket,
          messageId,
          senderId,
          recipientId,
          timestamp,
          message
        )
      ),
    onMessageSent: (temporaryMessageId, newMessageId, userId, recipientId) =>
      dispatch(
        actions.onMessageSent(
          temporaryMessageId,
          newMessageId,
          userId,
          recipientId
        )
      ),
    onMessageState: (messagesId, userId, recipientId, msgState) =>
      dispatch(
        actions.onMessageState(messagesId, userId, recipientId, msgState)
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
