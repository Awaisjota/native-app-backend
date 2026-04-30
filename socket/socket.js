import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

/* =========================
   INIT SOCKET
========================= */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    /* =========================
       USER ONLINE
    ========================= */
    socket.on("online", (userId) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);
      socket.join(userId.toString());
    });

    /* =========================
       JOIN RIDE ROOM
    ========================= */
    socket.on("joinRide", (rideId) => {
      if (!rideId) return;

      socket.join(rideId);
    });

    /* =========================
       LEAVE RIDE ROOM
    ========================= */
    socket.on("leaveRide", (rideId) => {
      if (!rideId) return;

      socket.leave(rideId);
    });

    /* =========================
       DISCONNECT
    ========================= */
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      console.log("❌ Disconnected:", socket.id);
    });
  });

  return io;
};

/* =========================
   GETTERS
========================= */
export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;