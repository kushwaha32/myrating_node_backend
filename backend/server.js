// const app = require("./app");
// const dotenv = require("dotenv");
// const connectDb = require("./config/db");

// // adding socket.io configuration
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   pingTimeout: 60000,
//   cors: {
//     // origin: "http://localhost:3000",
//     origin: "*",
//     // credentials: true,
//     // methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
//     // allowedHeaders: [
//     //   "Access-Control-Allow-Headers",
//     //   "Origin,Accept",
//     //   "X-Requested-With",
//     //   "authorization",
//     //   "Content-Type",
//     //   "Access-Control-Request-Method",
//     //   "Access-Control-Request-Headers",
//     // ],
//   },
// });

// // handling the uncaught exception

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION. Shutting down");
//   console.log(err);
//   process.exit(1);
// });

// // config
// dotenv.config({ path: `${__dirname}/config/config.env` });

// // connect database
// connectDb();

// const newServer = server.listen(process.env.PORT, () => {
//   console.log(`server is running on ${process.env.PORT}`);
// });

// io.on("connection", (socket) => {
//   console.log("a user connected");
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
//   // like socket event
//   socket.on("like-f", data => {
//     io.emit("likes-b", data);
//   })
//   socket.on("likes-d-f", data => {
//     io.emit("likes-d-b", data)
//   })

//   // review socket event
//   socket.on("review-f", data => {
//     console.log(data);
//     io.emit("review-b", data);
//   })
//   socket.on("review-d-f", data => {
//     io.emit("review-d-b", data)
//   })
// });


// // handling the unhandled promiss rejection
// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION. Shutting down...");
//   console.log(err);
//   newServer.close(() => {
//     process.exit(1);
//   });
// });


// const app = require("./app");
// const dotenv = require("dotenv");
// const connectDb = require("./config/db");

// // Import AWS SDK and create WebSocket instance
// const AWS = require("aws-sdk");
// const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
//   endpoint: " https://8dzjgxpms1.execute-api.ap-south-1.amazonaws.com/production/" // Replace with your WebSocket API endpoint
// });

// // handling the uncaught exception
// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION. Shutting down");
//   console.log(err);
//   process.exit(1);
// });

// // config
// dotenv.config({ path: `${__dirname}/config/config.env` });

// // connect database
// connectDb();

// const newServer = app.listen(process.env.PORT, () => {
//   console.log(`Server is running on ${process.env.PORT}`);
// });

// // AWS Lambda function for handling WebSocket connections
// module.exports.connect = async (event, context) => {
//   const connectionId = event.requestContext.connectionId;

//   // Additional logic as needed...
//   console.log("connected")
//   return {
//     statusCode: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "*", // Update this to match your allowed origins
//       "Access-Control-Allow-Headers": "Content-Type",
//       "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
//     },
//     body: "Connected",
//   };
// };

// // AWS Lambda function for handling WebSocket disconnections
// module.exports.disconnect = async (event, context) => {
//   const connectionId = event.requestContext.connectionId;

//   // Additional logic as needed...

//   return { statusCode: 200, body: "Disconnected" };
// };

// // AWS Lambda function for handling WebSocket messages
// module.exports.message = async (event, context) => {
//   const connectionId = event.requestContext.connectionId;
//   const message = JSON.parse(event.body).message;

//   // Additional logic as needed...

//   return { statusCode: 200, body: "Message sent" };
// };

// // handling the unhandled promise rejection
// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION. Shutting down...");
//   console.log(err);
//   newServer.close(() => {
//     process.exit(1);
//   });
// });




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
