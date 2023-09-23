// third party modules
const express = require("express");

// user module
const authController = require("../controllers/authController");

const router = express.Router();

// signup route
router.post("/signup", authController.signUP);

// signup via otp

router.post("/signUpViaOtp", authController.signUpViaOtp);

// verify otp
router.post("/otpVerify", authController.otpVerify);

// create user password
router.patch(
  "/createUserPassword",
  authController.protect,
  authController.restrictTo("user"),
  authController.createUserPassword
);

// resend otp to contact no
router.post("/reSendOtpToContact", authController.sendOtpToContact);

// resend otp to email id
router.post("/reSendOtpToEmail", authController.sendOtpToEmail);

// login route
router.post("/login", authController.login);

// login with otp
router.post("/loginWithOtp", authController.loginViaOtp);

// verify login with otp
router.post("/loginOtpVerify", authController.LoginOtpVerify);

// logout the user
router.post("/logout", authController.logout);

// forget password route
router.post("/forgotPassword", authController.forgetPassword);

// validate forget password otp
router.post(
  "/validateForgetPasswordOtp",
  authController.forgetPasswordOtpVerify
);

// reset password route
router.patch("/resetPassword", authController.resetPassword);

// brand sign up
router.post("/brandSignup", authController.brandSignUP);

// brand sign up otp verify
router.post("/brandSignUPOtpVerify", authController.brandSignUPOtpVerify);

// brand create password and profile
router.patch(
  "/brandCreatePass",
  authController.protect,
  authController.restrictTo("business"),
  authController.brandPassAndProfile
);

// update password

router
  .route("/updateMyPassword")
  .patch(
    authController.protect,
    authController.restrictTo("user", "business"),
    authController.updateMyPassword
  );

// update the credentials (email and contactNumber)

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("user", "business"),
    authController.updateContactInfo
  );

//////////////////////////////////////////////////////////
/////-- check user allready created password route --////
////////////////////////////////////////////////////////
router
  .route("/check_has_password")
  .get(
    authController.protect,
    authController.restrictTo("user"),
    authController.checkUserHasPassword
  );

// update user

router.patch("/updateMe", authController.protect, authController.updateMe);

router.delete("/deleteMe", authController.protect, authController.deleteMe);

module.exports = router;
