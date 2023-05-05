import express from "express";
import logger from "morgan";
import cors from "cors";
import clc from "cli-color";
import fs from "fs";
import path from "path";

import contactsRouter from "./routes/api/contacts.js";
import usersRouter from "./routes/api/users.js";
import cookieParser from "cookie-parser";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

// check if folders required for avatars handling, exists
const tempDir = path.normalize(`temp`);
const publicDir = path.normalize(`public`);
const avatarDir = path.normalize(`public/avatars`);
!fs.existsSync(tempDir) && fs.mkdirSync(tempDir);
!fs.existsSync(publicDir) && fs.mkdirSync(publicDir);
!fs.existsSync(avatarDir) && fs.mkdirSync(avatarDir);

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(clc.red.bold("Error: ") + clc.red(err.message));
  res.status(err.statusCode || 500).json(err.message || "Server error");
});

export default app;
