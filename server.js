import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRouter from "./routes/authRouter.js";
import rideRouter from "./routes/rideRouter.js";
import adminRouter from "./routes/adminRouter.js";

import { initSocket } from "./socket/socket.js";

dotenv.config();

/* =========================
   DB CONNECTION
========================= */
connectDB();

/* =========================
   APP INIT
========================= */
const app = express();

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://192.168.43.229:5173",
  "http://localhost:8081",
  "https://your-frontend-domain.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRouter);
app.use("/api/rides", rideRouter);
app.use("/api/admin", adminRouter);


/* =========================
   SERVER
========================= */
const server = http.createServer(app);

/* =========================
   SOCKET INIT
========================= */
const io = initSocket(server);

/* =========================
   GLOBAL ACCESS
========================= */
app.locals.io = io;

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});