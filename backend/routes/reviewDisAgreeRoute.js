
const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { createReviewDisAgree, getAllReviewDisAgree } = require("../controllers/reviewAgreeAndDisAgreController");


const router = express.Router({mergeParams: true});


router.route("/").get(getAllReviewDisAgree);

router.route("/").post(protect, restrictTo("user"), createReviewDisAgree);


module.exports = router