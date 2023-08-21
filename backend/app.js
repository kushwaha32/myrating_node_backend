const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/appError");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoute");
const likeRoutes = require("./routes/likesRoutes");
const userProffessionRoute = require("./routes/userProffessionRoute");
const userProfileRoute = require("./routes/userProfileRoute");
const brandProfileRoute = require("./routes/brandProfileRoute");
const topBrandRoute = require("./routes/topBrandRoute");
const industryRoute = require("./routes/industryRoute");
const industrySubCatRoute = require("./routes/industrySubCategoryRoute");
const regiteredAsRoute = require("./routes/registeredAsRoute");
const reviewDisAgreeRoute = require("./routes/reviewDisAgreeRoute");
const reviewAgreeRoute = require("./routes/reviewAgreeRoute");
const searchCityRoute = require("./routes/searchCityRoute");
const brandProductRoute = require("./routes/business/businessRoute");
const bucketImgRoute = require("./routes/bucketImgRoute");

const app = express();
app.use(express.static(`${__dirname}/public`));
// 1) GLOBAL MIDDLEWARES
// prevent cross site scription
const corsOpts = {
  // origin: "http://localhost:3000",
  origin: ["http://localhost:3000", "https://myratings.in"],
  credentials: true,
  methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "Access-Control-Allow-Headers",
    "Origin,Accept",
    "X-Requested-With",
    "authorization",
    "Content-Type",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
};

app.use(cors());

app.use(helmet());

// limit the number of req for perticular ip in desided hours
// const limiter = rateLimit({
//   max: 1000,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// app.use("/api", limiter);

// body parser, reading body data from body into req.body
app.use(express.json({ limit: "50kb" }));

// cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean());

// Prevent parameter polution
app.use(hpp());

// serving the static files
app.use(express.static(`${__dirname}/public`));

// routes

// user route

// bucket permision
app.use("/api/v1/s3bucktet", bucketImgRoute)

app.use("/api/v1/user", userRoutes);

// product route
app.use("/api/v1/product", productRoutes);

// brand product route
app.use("/api/v1/BrandProduct", brandProductRoute)

// review route
app.use("/api/v1/review", reviewRoutes);

// likes route
app.use("/api/v1/like", likeRoutes);

// user proffession
app.use("/api/v1/userproffession", userProffessionRoute);

// user profile
app.use("/api/v1/profile", userProfileRoute);

// brand profile
app.use("/api/v1/brandProfile", brandProfileRoute);

// top brand route
app.use("/api/v1/topBrand", topBrandRoute);

// industry category route
app.use("/api/v1/industry", industryRoute);

// industry sub category route
app.use("/api/v1/industrySubCat", industrySubCatRoute);

// registered as route
app.use("/api/v1/registeredAs", regiteredAsRoute);

// reviewAgreeAndDisAgree route
app.use("/api/v1/reviewAgree", reviewAgreeRoute);
app.use("/api/v1/reviewDisAgree", reviewDisAgreeRoute);

// searched city routes
app.use("/api/v1/searchCity", searchCityRoute);

// handling invalid routes

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error middle
app.use(errorMiddleware);

module.exports = app;
