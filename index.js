import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React dev server origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const onlineUserList = [];
const removeUser = (socketId, socket) => {
  const index = onlineUserList.findIndex(
    (item) => item.socketid === socketId
  );
  if (index !== -1) {
    onlineUserList.splice(index, 1); // removes the item in place
  }
  console.log("onlineUserList", onlineUserList);
  io.emit("onlineUserList", onlineUserList);
};

io.on("connection", (socket) => {
  console.log(`A new user${socket.id} has joined!`);

  socket.on("joinRoom", (roomName) => {
    console.log(socket.rooms);
    if (socket.rooms.has(roomName)) {
      console.log("Already in room", roomName);
      return;
    }
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      }
    }
    socket.join(roomName);
    console.log(`${socket.id} joined room: ${roomName}`);
  })

  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id} left room: ${roomName}`);
  });

  


  socket.on("onlineUserList", (operator, user) => {
    if (operator === "add") {
    console.log("add", user)

      onlineUserList.push({ ...user, socketid: socket.id });
    }
    console.log("emit onlineUserList", onlineUserList);
    io.emit("onlineUserList", onlineUserList);
  });

  socket.on("message", (msg, room) => {
    io.to(room).emit("message", msg);
  });


  socket.on("request", (obj1, callback) => {
    console.log(obj1); // { foo: 'bar' }
  });
  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
    removeUser(socket.id, socket);
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:4000");
});
