const app = require("./app");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

// handling the uncaught exception
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION. Shutting down");
  console.log(err);
  process.exit(1);
});

// config
dotenv.config({ path: `${__dirname}/config/config.env` });

// connect database
connectDb();

const newServer = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});

// handling the unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION. Shutting down...");
  console.log(err);
  newServer.close(() => {
    process.exit(1);
  });
});
