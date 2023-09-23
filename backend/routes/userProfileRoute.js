const express = require("express");
const {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateUserProfileImage,
  updateDocumentId,
  updateProfilePrivacy,
} = require("../controllers/userProfileController");
const { protect, restrictTo } = require("../controllers/authController");
const { uploadProductImage } = require("../controllers/productController");

const router = express.Router();

// get the authenticate user profile
router.route("/").get(protect, restrictTo("user"), getUserProfile);

// create the authenticate user profile
router
  .route("/")
  .post(protect, restrictTo("user"), uploadProductImage, createUserProfile);

// update the authenticate user profile
router
  .route("/")
  .patch(protect, restrictTo("user"), uploadProductImage, updateUserProfile);

// update only user Profile image
router
  .route("/update-profile-image")
  .patch(protect, restrictTo("user"), updateUserProfileImage);

// update document id
router
  .route("/update-document-id")
  .patch(protect, restrictTo("user"), updateDocumentId);

router
  .route("/update-profile-privacy")
  .patch(protect, restrictTo("user"), updateProfilePrivacy);

module.exports = router;
