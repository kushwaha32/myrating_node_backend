const express = require("express");
const { getAllIndustry, createIndustry } = require("../controllers/IndustryController");
const { protect, restrictTo } = require("../controllers/authController");


const router = express.Router();

// get all the industry route
router.route("/").get(getAllIndustry);

// create a new industry
router.route("/").post(protect, restrictTo("admin"),createIndustry);


module.exports = router;