const express = require("express");
const { getTopBrand } = require("../controllers/topBrandController");


const router = express.Router();


router.route("/").get(getTopBrand)



module.exports = router;