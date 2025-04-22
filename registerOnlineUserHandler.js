const onlineUsers = new Map();

const updateOnlineUsersList = (io) => {
  io.emit("online_user_list", Array.from(onlineUsers.values()));
};

const registerOnlineUserHandler = (io, socket) => {
  const doOnlineUser = (operator, user) => {
    if (operator === "add") {
      console.log("add", user);
      onlineUsers.set(socket.id, { ...user, socketid: socket.id });
    }
    console.log(
      " Broadcasting onlineUserList:",
      Array.from(onlineUsers.values())
    );
    updateOnlineUsersList(io);
  }
  
  const disconnect = (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
    onlineUsers.delete(socket.id);
    updateOnlineUsersList(io);
  }

  socket.on("online_user_list", doOnlineUser);
  socket.on("disconnect", disconnect);
};

export default registerOnlineUserHandler;
