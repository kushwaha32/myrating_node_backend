const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
  getToursWithin,
  uploadImage,
  uploadProductImage,
  getSubCategoryId,
} = require("../controllers/productController");
const reviewRouter = require("./reviewRoute");
const likeRouter = require("./likesRoutes");




const router = express.Router();


router.post("/uploadImg", protect, restrictTo("business", "admin"), uploadProductImage, uploadImage);

router.use("/:productSlug/review", reviewRouter);

router.use("/:productId/like", likeRouter);

// get product within
router.route("/product-within/:distance/center/:latlng/unit/:unit").get(getToursWithin);

// Get all the Product
router.route("/").get(getSubCategoryId, getAllProduct);

// Create Product
router.route("/").post(protect, restrictTo("business", "admin"), createProduct);

// Get single product
router.route("/:productNameSlug").get(getSingleProduct);

// Update Product
router
  .route("/:id")
  .patch(protect, restrictTo("business", "admin"),  updateSingleProduct);

// Delete Product
router
  .route("/:id")
  .delete(protect, restrictTo("business", "admin"), deleteSingleProduct);

module.exports = router;
