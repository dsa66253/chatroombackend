import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { on } from "node:events";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React dev server origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Serve static file
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const onlineUsers = new Map();

const updateOnlineUsersList = () => {
  io.emit("onlineUserList", Array.from(onlineUsers.values()));
};

const onConnection = (socket) => {
  console.log(`A new user${socket.id} has joined!`);

  socket.on("joinRoom", (roomName) => {
    console.log("rooms", socket.rooms);
    if (socket.rooms.has(roomName)) {
      // console.log("Already in room", roomName);
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

      onlineUsers.set(socket.id, { ...user, socketid: socket.id });
    }
    console.log("📤 Broadcasting onlineUserList:", Array.from(onlineUsers.values()));
    updateOnlineUsersList();
  });

  socket.on("message", (msg, room) => {
    io.to(room).emit("message", msg);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
    onlineUsers.delete(socket.id);
    updateOnlineUsersList();
  });
}


io.on("connection", onConnection);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});