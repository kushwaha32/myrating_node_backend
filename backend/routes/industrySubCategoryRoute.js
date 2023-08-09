const express = require("express");
const {
  getIndustrySubCat,
  createIndustrySubCat,
  getCategoryIfHasProduct,
  getProductsFromCategory,
} = require("../controllers/industrySubCatController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/category/:slug")
  .get(protect, restrictTo("business"), getProductsFromCategory);

router
  .route("/hasProduct")
  .get(protect, restrictTo("business"), getCategoryIfHasProduct);

  // public route
  router
  .route("/public/hasProduct")
  .get(getCategoryIfHasProduct);

  router
  .route("/category/public/:slug")
  .get(protect, restrictTo("business"), getProductsFromCategory);

router.route("/").get(getIndustrySubCat);

router.route("/").post(protect, restrictTo("admin"), createIndustrySubCat);

module.exports = router;
