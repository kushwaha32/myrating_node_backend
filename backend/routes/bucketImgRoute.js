
const express = require("express");
const { connectToAwsBucket } = require("../controllers/s3BucketAuthController");

const router = express.Router();

router.route("/").get(connectToAwsBucket)

module.exports = router