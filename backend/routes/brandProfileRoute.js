const express = require("express");
const {
  updateBusinessProfile,
  getSingleBrand,
  updateBrandIndustry,
  updateLocationInfo,
  updateContactInfo,
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

//////////////////////////////////////////////////////////////////
///////////////--- update brand industry route ---///////////////
////////////////////////////////////////////////////////////////
router
  .route("/update/brand-industry")
  .patch(protect, restrictTo("business"), updateBrandIndustry);

//////////////////////////////////////////////////////////////////
///////////////--- update brand location route ---///////////////
////////////////////////////////////////////////////////////////
router
  .route("/update/location-information")
  .patch(protect, restrictTo("business"), updateLocationInfo);

///////////////////////////////////////////////////////////////////////
///////////////--- update contact information route ---///////////////
/////////////////////////////////////////////////////////////////////
router
  .route("/update/contact-information")
  .patch(protect, restrictTo("business"), updateContactInfo);

module.exports = router;
