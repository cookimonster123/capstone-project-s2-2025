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
import semesters from "./routes/semesters";
import { loggingMiddleware } from "./middleware/loggingMiddleware";

// Import models to ensure they are registered with Mongoose
import "@models";

dotenv.config();

const app = express();

app.use(loggingMiddleware);

// Behind a reverse proxy (e.g., Caddy/Nginx) so secure cookies are respected
app.set("trust proxy", 1);

app.use(
   cors({
      origin: (origin, callback) => {
         const allowed = [
            process.env.CLIENT_URL, // e.g. https://www.capstones.click
            "http://localhost:5173",
         ].filter(Boolean) as string[];
         if (!origin || allowed.includes(origin)) return callback(null, true);
         // allow subdomain variants if needed
         try {
            const o = new URL(origin);
            const allowedHosts = allowed.map((u) => new URL(u).host);
            if (allowedHosts.includes(o.host)) return callback(null, true);
         } catch {}
         return callback(new Error("CORS not allowed"));
      },
      credentials: true,
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
app.use("/api/semesters", semesters);

export default app;
