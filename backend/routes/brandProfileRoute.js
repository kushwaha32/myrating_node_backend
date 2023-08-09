

const express = require("express");
const { updateBusinessProfile, getSingleBrand } = require("../controllers/BusinessProfileController");
const { protect, restrictTo } = require("../controllers/authController");
const { uploadProductImage } = require("../controllers/productController");

const router = express.Router();


router.route("/:id").patch(protect, restrictTo("business"), uploadProductImage, updateBusinessProfile);

router.route("/:brandSlug").get(getSingleBrand);

module.exports = router