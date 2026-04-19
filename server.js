import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import rideRouter from "./routes/rideRouter.js";
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();
const app = express();
// Allow frontend origin
app.use(
  cors({
    origin: ["http://192.168.43.229:5173", "http://192.168.43.229:8081", "http://192.168.43.229:8080", "http://192.168.43.229:8082", "http://localhost:8081"], // remove trailing slash
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter)
app.use("/api", rideRouter);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is runing on http://localhost:${PORT}`);
});
