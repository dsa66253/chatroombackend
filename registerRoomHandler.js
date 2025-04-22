const registerOnlineUserHandler = (io, socket) => {
  const joinRoom = (roomName) => {
    console.log("rooms", socket.rooms);
    if (socket.rooms.has(roomName)) {
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
  };

  const leaveRoom = (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id} left room: ${roomName}`);
  };

  const emitMessage = (msg, room) => {
    io.to(room).emit("message", msg);
  };
  
  socket.on("message", emitMessage);
  socket.on("join_room", joinRoom);
  socket.on("leave_room", leaveRoom);
};

export default registerOnlineUserHandler;