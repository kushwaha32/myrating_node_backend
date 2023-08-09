
const app = require("./app");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

// handling the uncaught exception

process.on("uncaughtException", err => {
    console.log("UNCAUGHT EXCEPTION. Shutting down");
    console.log(err);
    process.exit(1);
   
})



// config
dotenv.config({path: `${__dirname}/config/config.env`});

// connect database
connectDb();

const server = app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`)
});

// handling the unhandled promiss rejection
process.on('unhandledRejection', err => {
    console.log("UNHANDLED REJECTION. Shutting down...");
    console.log(err);
    server.close(() => {
        process.exit(1);
    })
    
});



