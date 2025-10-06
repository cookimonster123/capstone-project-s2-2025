import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import auth from "./routes/auth";
import projects from "./routes/projects";
import users from "./routes/users";
import file from "./routes/file";
import tags from "./routes/tags";
import categories from "./routes/categories";
import awards from "./routes/awards";
import comments from "./routes/comments";
import teams from "./routes/teams";
import { loggingMiddleware } from "./middleware/loggingMiddleware";

// Import models to ensure they are registered with Mongoose
import "@models";

dotenv.config();

const app = express();

app.use(loggingMiddleware);

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
app.use("/api/projects", projects);
app.use("/api/users", users);
app.use("/api/files", file);
app.use("/api/tags", tags);
app.use("/api/categories", categories);
app.use("/api/awards", awards);
app.use("/api/comments", comments);
app.use("/api/teams", teams);

export default app;
