const express = require("express");
const {
  createReviewAgree,
  getAllReviewAgree,
} = require("../controllers/businessReviewAgreeAndDisAgreeController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/").get(getAllReviewAgree);

router.route("/").post(protect, restrictTo("user"), createReviewAgree);

module.exports = router;
