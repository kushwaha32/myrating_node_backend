const express = require("express");
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  convertProductSlug,
  rDistribution,
  avgRatingBrandProfile,
} = require("../controllers/BusinessReviewController");
const { protect, restrictTo } = require("../controllers/authController");
const brandReviewAgreeRoute = require("./businessReviewAgreeRoute");
const brandReviewDisAgreeRoute = require("./businessReviewDisAgreeRoute");

const router = express.Router({ mergeParams: true });

router.use("/:reviewId/businessReviewAgree", brandReviewAgreeRoute);
router.use("/:reviewId/businessReviewDisAgree", brandReviewDisAgreeRoute);

// routes

// get all the reviews or reviews associated with some product
router.route("/").get(convertProductSlug, getAllReviews);

// create a review
router.route("/").post(protect, restrictTo("user"), createReview);

// update a review
router.route("/:reviewId").patch(protect, restrictTo("user"), updateReview);

// delete a review
router.route("/:reviewId").delete(protect, restrictTo("user"), deleteReview);

// average rating
router.route("/avgRating").get(avgRatingBrandProfile);

// rating distribution
router.route("/rDistribution").get(rDistribution);

module.exports = router;
