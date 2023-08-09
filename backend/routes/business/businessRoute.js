const express = require("express");
const { getAllBrandProduct, convertSlubToId } = require("../../controllers/business/businessProductController");

const router = express.Router();


router.route("/").get(convertSlubToId,getAllBrandProduct);


module.exports = router;