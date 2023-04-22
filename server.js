import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

const PORT = 3000;
dotenv.config();

app.listen(PORT, () => {
  console.log(`Server running. Use our API on port: ${PORT}`);
});

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
