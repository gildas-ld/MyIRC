const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
var users = [];

var channels = ["#accueil"];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    socket.user = data.username;
    socket.join(data.room);
    io.sockets.in(data.room).emit("connectToRoom", data.username);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave", (data) => {
    socket.leave(data.room);
    socket.to(data.room).emit("leaved", data);
  });

  socket.on("disconnect", () => {});

  socket.on("list", (data) => {
    const arr = Array.from(io.sockets.adapter.rooms);
    const filtered = arr.filter((room) => !room[1].has(room[0]));
    io.sockets.emit("listed", filtered);
  });

  socket.on("newroom", (data) => {
    socket.join(data.room);
    io.sockets.in(data.oldroom).emit("createRoom", data);
  });

  socket.on("switchRoom", function (newroom) {
    socket.to(newroom.oldroom).emit("leaved", newroom);
    socket.join(newroom.room);
    io.sockets.in(newroom.room).emit("connectToRoom", newroom.username);
  });

  socket.on("deleteRoom", (data) => {
    socket.leave(data.room);
    io.sockets.in(data.oldroom).emit("deleteRoomrep", data);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
