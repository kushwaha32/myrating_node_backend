const express = require("express");
const {
  updateBusinessProfile,
  getSingleBrand,
  updateBrandIndustry,
  updateLocationInfo,
  updateContactInfo,
  getSingleBrandFromUser,
  updateOtherInfo,
  updateKeywords,
  updatePhotoProfile,
  updateSubmitVerify,
} = require("../controllers/BusinessProfileController");
const { protect, restrictTo } = require("../controllers/authController");
const { uploadProductImage } = require("../controllers/productController");
const brandReviewRoute = require("../routes/brandReviewRoute");
const brandLikeRoute = require("../routes/brandLikeRoute");

const router = express.Router();

router
  .route("/:id")
  .patch(
    protect,
    restrictTo("business"),
    uploadProductImage,
    updateBusinessProfile
  );
router.use("/:brandSlug/brandReview", brandReviewRoute);
router.route("/:brandSlug").get(getSingleBrand);
router.route("/user/:userId").get(getSingleBrandFromUser);

router.use("/:brandProfileId/brandLike", brandLikeRoute);

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

///////////////////////////////////////////////////////////////////////
///////////////--- update other information route ---///////////////
/////////////////////////////////////////////////////////////////////
router
  .route("/update/other-information")
  .patch(protect, restrictTo("business"), updateOtherInfo);

///////////////////////////////////////////////////////////////////////
///////////////--- update keywords route ---///////////////
/////////////////////////////////////////////////////////////////////
router
  .route("/update/keywords")
  .patch(protect, restrictTo("business"), updateKeywords);

///////////////////////////////////////////////////////////////////////
///////////////--- update photo route ---///////////////
/////////////////////////////////////////////////////////////////////
router
  .route("/update/photo-profile")
  .patch(protect, restrictTo("business"), updatePhotoProfile);

///////////////////////////////////////////////////////////////////////
///////////////--- update submit verify route ---///////////////
/////////////////////////////////////////////////////////////////////
router
  .route("/update/submit-verify")
  .patch(protect, restrictTo("business"), updateSubmitVerify);

module.exports = router;
