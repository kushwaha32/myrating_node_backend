const express = require("express");
const {
  updateBusinessProfile,
  getSingleBrand,
  updateBrandIndustry,
} = require("../controllers/BusinessProfileController");
const { protect, restrictTo } = require("../controllers/authController");
const { uploadProductImage } = require("../controllers/productController");

const router = express.Router();

router
  .route("/:id")
  .patch(
    protect,
    restrictTo("business"),
    uploadProductImage,
    updateBusinessProfile
  );

router.route("/:brandSlug").get(getSingleBrand);

router
  .route("/update/brand-industry")
  .patch(protect, restrictTo("business"), updateBrandIndustry);

module.exports = router;
