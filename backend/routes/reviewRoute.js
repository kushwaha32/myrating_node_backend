const express = require("express");
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  convertProductSlug,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// routes

// get all the reviews or reviews associated with some product
router.route("/").get(convertProductSlug, getAllReviews);

// create a review
router.route("/").post(protect, restrictTo("user"), createReview);

// update a review
router.route("/:reviewId").patch(protect, restrictTo("user"), updateReview);

// delete a review
router.route("/:reviewId").delete(protect, restrictTo("user"), deleteReview);

module.exports = router;
