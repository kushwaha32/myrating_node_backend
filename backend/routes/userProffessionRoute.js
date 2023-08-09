

const express = require("express");
const { createProffession, getProffession, updateProffession, deleteProffession } = require("../controllers/userProffesionController");
const { restrictTo, protect } = require("../controllers/authController");

const router = express.Router();

// getProffession
// createProffession
// updateProffession
// deleteProffession

router.route("/").get(getProffession);
router.route("/").post(protect, restrictTo("admin"), createProffession);
router.route("/:id").patch(protect, restrictTo("admin"), updateProffession);
router.route("/:id").delete(protect, restrictTo("admin"), deleteProffession);



module.exports =  router;
