
const express = require("express");
const { getSearchCity } = require("../controllers/searchedCityController");
const { protect } = require("../controllers/authController");


const router = express.Router();

router.route("/").get(protect, getSearchCity);

module.exports = router;
