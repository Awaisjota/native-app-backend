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
const allowedOrigins = [
  "http://192.168.43.229:5173",
  "http://localhost:8081",
  "https://your-frontend-domain.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // mobile apps ko allow kar do
      }
    },
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