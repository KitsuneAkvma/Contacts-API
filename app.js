import express, { json } from "express";
import logger from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import contactsRouter from "./routes/api/contacts.js";
import usersRouter from "./routes/api/users.js";
import cookieParser from "cookie-parser";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json(err.message || "Server error");
});

export default app;
