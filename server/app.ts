import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import auth from "./routes/auth";

dotenv.config();

const app = express();

app.use(cors());
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", auth);

export default app;
