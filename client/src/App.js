// @ts-nocheck
import { useState } from "react";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import io from "socket.io-client";
import "./App.css";
import Chat from "./Chat";
import { Commands } from "./Commands.js";
import "./bootstrap.css";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if ("" !== username && "" !== room) {
      socket.emit("join_room", { room: room, username: username });
      setShowChat(true);
    }
  };

  return (
    <div>
      <div className="App">
        <ReactNotifications />
        {showChat ? (
          <div className="container-fluid">
            <Commands />

            <Chat socket={socket} username={username} room={room} />
          </div>
        ) : (
          <div className="joinChatContainer">
            <div className="joinChat">
              <input
                className="form-control"
                type="text"
                placeholder="Nom d'utilisateur"
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
              />
              <input
                className="form-control"
                type="text"
                placeholder="Nom de la room"
                onKeyUp={(e) => {
                  e.key === "Enter" && joinRoom();
                }}
                onChange={(event) => {
                  setRoom(event.target.value);
                }}
              />
              <button type="button" className="btn btn-info" onClick={joinRoom}>
                Rejoignez une room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
