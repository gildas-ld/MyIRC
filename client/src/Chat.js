// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Store } from "react-notifications-component";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [userName, setUserName] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [roomchange, setRoomchange] = useState("");

  useEffect(() => {
    setUserName(username);
  }, [username]);

  useEffect(() => {
    setRoomchange(room);
  }, [room]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      if (currentMessage.startsWith("/nick")) {
        let newUsername = currentMessage.substring(6);
        setUserName(newUsername);
      }

      if (currentMessage.startsWith("/leave")) {
        await socket.emit("leave", { room: roomchange, username: userName });
        window.location.reload();
      }

      if (currentMessage.startsWith("/list")) {
        await socket.emit("list", { room: roomchange, username: userName });
      }

      if (currentMessage.startsWith("/join")) {
        let newjoin = currentMessage.substring(6);

        socket.emit("switchRoom", {
          room: newjoin,
          username: userName,
          oldroom: roomchange,
        });
        setRoomchange(newjoin);
      }

      if (currentMessage.startsWith("/create")) {
        let newjoin = currentMessage.substring(8);

        socket.emit("newroom", {
          room: newjoin,
          username: userName,
          oldroom: roomchange,
        });
      }

      if (currentMessage.startsWith("/delete")) {
        let newjoin = currentMessage.substring(8);

        socket.emit("deleteRoom", {
          room: newjoin,
          username: userName,
          oldroom: roomchange,
        });
      }
      const messageData = {
        room: roomchange,
        author: userName,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("listed", (data) => {
      const onlineRooms = ["toutes les rooms en ligne :"];
      data.map((x) => onlineRooms.push(x[0]));
      const listed = onlineRooms.join(" --- ");
      const messageServ = {
        room: roomchange,
        author: "server",
        message: listed,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      setMessageList((list) => [...list, messageServ]);
    });
  }, [roomchange, socket]);

  useEffect(() => {
    socket.on("connectToRoom", (data) => {
      Store.addNotification({
        message: "bienvenue a " + data + " qui a rejoint le chat",
        type: "info",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.on("createRoom", (data) => {
      Store.addNotification({
        message: `${data.username} a créé un nouveau channel nommé ${data.room}`,
        type: "info",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.on("leaved", (data) => {
      Store.addNotification({
        message: `${data.username} a quitté la room`,
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.on("deleteRoomrep", (data) => {
      Store.addNotification({
        message: `${data.username} a supprimé le channel ${data.room}`,
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.on("receive_channel", (data) => {
      // console.warn(`\n🚀 > data:`, data);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Room : {roomchange}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={userName === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          className="form-control input-messages"
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyUp={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button
          type="button"
          className="btn btn-info bouton "
          onClick={sendMessage}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default Chat;
