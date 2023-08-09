
const express = require("express");
const { getRegisteredAs, createRegisteredAs } = require("../controllers/RegisteredAsController");


const router = express.Router();


router.route("/").get(getRegisteredAs);

router.route("/").post(createRegisteredAs);


module.exports = router;