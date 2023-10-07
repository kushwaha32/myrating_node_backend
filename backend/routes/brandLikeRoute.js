const express = require("express");
const {
  createLike,
  deleteLike,
  getUserFavourites,
  getLikes,
} = require("../controllers/brandLikeController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/").get(getLikes);
router.route("/").post(protect, restrictTo("user", "business"), createLike);
router.route("/").delete(protect, restrictTo("user", "business"), deleteLike);
router
  .route("/user")
  .get(protect, restrictTo("user", "business"), getUserFavourites);

module.exports = router;
