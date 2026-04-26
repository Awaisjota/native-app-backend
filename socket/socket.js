import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    // console.log("⚡ User connected:", socket.id);

    // 🔥 JOIN ROOM (IMPORTANT)
    socket.on("joinRide", (rideId) => {
      socket.join(rideId);
      // console.log(`User joined ride: ${rideId}`);
    });

    // 🔥 LEAVE ROOM
    socket.on("leaveRide", (rideId) => {
      socket.leave(rideId);
      // console.log(`User left ride: ${rideId}`);
    });

    socket.on("disconnect", () => {
      // console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

// controller se use karne ke liye
export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};