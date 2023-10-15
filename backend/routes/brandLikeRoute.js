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
router.route("/").post(protect, restrictTo("user"), createLike);
router.route("/").delete(protect, restrictTo("user"), deleteLike);
router
  .route("/user")
  .get(protect, restrictTo("user", "business"), getUserFavourites);

module.exports = router;
