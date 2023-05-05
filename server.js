import app from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import clc from "cli-color";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    clc.greenBright.bgBlackBright.bold(
      `Server running. Use my API on port: ${PORT}`
    )
  );
});

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(clc.cyanBright.bold("Connected to MongoDB successfully!"));
  })
  .catch((err) => {
    console.error(clc.red.bold("Error connecting to MongoDB:"), err);
  });

const shutdown = () => {
  console.log(
    clc.yellowBright.bgBlackBright.bold(
      "Received shutdown signal. Closing server and database connection..."
    )
  );
  // close the server
  server.close(() => {
    console.log(clc.greenBright.bold("Server closed."));
    // disconnect from MongoDB
    mongoose.connection.close(false, () => {
      console.log(clc.greenBright.bold("Disconnected from MongoDB."));
      console.log(
        clc.yellowBright.bgBlackBright.bold(
          "Server stopped and disconnected from MongoDB."
        )
      );
      // exit the process
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
