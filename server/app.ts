import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import auth from "./routes/auth";

dotenv.config();

const app = express();

app.use(
   cors({
      origin:
         `http://localhost:${process.env.CLIENT_URL}` ||
         "http://localhost:5173",
      credentials: true, // Allow cookies to be sent
   }),
);
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", auth);

export default app;
