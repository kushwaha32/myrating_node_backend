
const express = require("express");
const { createReviewAgree, createReviewDisAgree } = require("../controllers/reviewAgreeAndDisAgreController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();


router.route("/agree").post(protect, restrictTo("user"), createReviewAgree);

router.route("/disagree").post(protect, restrictTo("user"), createReviewDisAgree);


module.exports = router;