import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import rideRouter from "./routes/rideRouter.js";
import adminRouter from "./routes/adminRouter.js";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://192.168.43.229:5173",
      "http://192.168.43.229:8081",
      "http://192.168.43.229:8080",
      "http://192.168.43.229:8082",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api", rideRouter);
app.use("/api/admin", adminRouter);

// 🔥 IMPORTANT FIX (HTTP SERVER)
const server = http.createServer(app);

// 🔥 SOCKET INIT (VERY IMPORTANT ORDER)
initSocket(server);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});