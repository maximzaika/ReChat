import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import * as actions from "../store/actions";
import io from "socket.io-client";
import * as socketIoActions from "../shared/socketIoActionTypes";

import HorizontalLine from "../components/UI/HorizontalLine/HorizontalLine";
import DivOverflowY from "../components/UI/DivOverflowY/DivOverflowY";
import TextArea from "../components/UI/TextArea/TextArea";
import IcoSendMessage from "../assets/ico/ico-send-message";
import ButtonIcon from "../components/UI/ButtonIcon/ButtonIcon";
import ChatAvatar from "../components/Pages/Chat/ChatAvatar";
import ChatUserMessages from "../components/Pages/Chat/ChatUserMessages";
import MyLink from "../components/UI/MyLink/MyLink";
import { toDecrypt } from "../shared/aes";

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
    fetchData(socket, isAuth, { userId: authUserId });
  }, [fetchData]);

  const dateFormat = require("dateformat");
  const history = useHistory();

  /** ADDED */
  const onInputMessageHandler = (value) => {
    messageInput(socket, value);
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
  };

  useEffect(() => {
    /** added */
    socket.on(
      socketIoActions.onlineStatus,
      ({ recipientId, socketId, userId, online, lastOnline }) => {
        onOnlineStateChange(recipientId, userId, online, lastOnline);
      }
    );

    /** added */
    socket.on(
      socketIoActions.typingState,
      ({ recipientId, userId, typingState }) => {
        onTypingStateChange(recipientId, userId, typingState);
      }
    );

    /** added */
    socket.on(
      socketIoActions.message,
      ({ id, senderId, recipientId, timestamp, message, messageStatus }) => {
        emitMsgSeen(socket, id, senderId, recipientId);
        onNewMessage(socket, id, senderId, recipientId, timestamp, message);
      }
    );

    /** ADDED */
    socket.on(
      socketIoActions.messageSent,
      ({ temporaryMessageId, newMessageId, userId, recipientId }) => {
        onMessageSent(temporaryMessageId, newMessageId, userId, recipientId);
      }
    );

    /** added */
    socket.on(
      socketIoActions.messageReceived,
      ({ messagesId, userId, recipientId }) => {
        onMessageState(messagesId, userId, recipientId, 1);
      }
    );

    /** added */
    socket.on(
      socketIoActions.messageSeen,
      ({ messagesId, userId, recipientId }) => {
        onMessageState(messagesId, userId, recipientId, 2);
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

  const onClickDisplayMessagesHandler = (recipientId, index, uniqueId) => {
    showChat(socket, recipientId, index, uniqueId);
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
    fetchData: (socket, isAuth, friends) =>
      dispatch(actions.fetchData(socket, isAuth, friends)),
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
