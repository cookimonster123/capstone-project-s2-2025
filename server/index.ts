import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.listen(3000, () => {
  connectDB();
  console.log("Server is running on port http://localhost:3000/");
});

app.get("/", (_req, res) => {
  res.send("123123");
});
