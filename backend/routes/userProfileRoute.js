
const express = require("express");
const { getUserProfile, createUserProfile, updateUserProfile } = require("../controllers/userProfileController");
const { protect, restrictTo } = require("../controllers/authController");
const { uploadProductImage } = require("../controllers/productController");


const router = express.Router();

// get the authenticate user profile
router.route("/").get(protect, restrictTo("user"), getUserProfile);

// create the authenticate user profile
router.route("/").post(protect, restrictTo("user"), uploadProductImage,  createUserProfile);

// update the authenticate user profile
router.route("/").patch(protect, restrictTo("user"), uploadProductImage, updateUserProfile)




module.exports = router;