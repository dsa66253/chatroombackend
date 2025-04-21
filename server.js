import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { on } from "node:events";
import registerOnlineUserHandler from "./registerOnlineUserHandler.js";
import registerRoomHandler from "./registerRoomHandler.js";
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
// const __dirname = dirname(fileURLToPath(import.meta.url));
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });

const onConnection = (socket) => {
  console.log(`A new user${socket.id} has joined!`);
  registerRoomHandler(io, socket);
  registerOnlineUserHandler(io, socket);
}

io.on("connection", onConnection);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀Server running at http://localhost:${PORT}`);
});