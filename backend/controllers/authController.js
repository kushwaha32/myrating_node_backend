const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const sendSms = require("../utils/sms");

const User = require("../models/userModel");
const MobileOtp = require("../models/mobileOtpModel");
const EmailOtp = require("../models/emailOtpModel");
const BrandProfile = require("../models/brandProfileModel");
const UserProfile = require("../models/userProfileModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = false;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  user.verifyForgetPassOtp = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

// validate email or contact and generate the otp
const validateEmailOrContact = async (req) => {
  const { contactOrEmail } = req.body;
  try {
    // check if email or contact number is provided
    if (!contactOrEmail) {
      //  return next(new AppError("Please provide your email or contact number"));
      return next(new AppError("Please provide your contact number"));
    }

    // check if email or contact number exist
    // const userWithEmail = await User.findOne({ email: contactOrEmail });

    const userWithContactNO = await User.findOne({
      contactNumber: contactOrEmail,
    });

    // generate te otp
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // return { otp, userWithEmail, userWithContactNO };
    return { otp, userWithContactNO };
  } catch (error) {
    return next("Please prvide the correct field", 401);
  }
};

// send OTP to email and save to collection
const sendOtpToMailAndSaveToCollection = async (email, otp, res, next) => {
  const message = `Dear user \n ${otp} is your OTP for Login.\n Please don't share it with anyone.\n This OTP is 
  valid for 10 minutes only.\n\n My Rating Team`;
  try {
    // send otp to email
    await sendEmail({
      email: email,
      subject: "Your OTP for login",
      message,
    });

    // create the collection
    const emailOtp = new EmailOtp({ email: email, otp: otp });

    // encrypt the otp
    emailOtp.otp = await bcrypt.hash(emailOtp.otp, 12);

    // save the collection
    await emailOtp.save();
  } catch (error) {
    console.log(error);
    return next(new AppError("OTP does not send please try latter", 500));
  }
};

// send otp to contact number and save to the collection
const sendOtpToContactSaveToCollection = async (
  contactNumber,
  otp,
  res,
  next
) => {
  try {
    const response = await sendSms(otp, contactNumber, "151336");

    //  create the collection
    const mobileOtp = new MobileOtp({
      contactNumber: contactNumber,
      otp: otp,
    });

    //  encrypt the Otp
    mobileOtp.otp = await bcrypt.hash(mobileOtp.otp, 12);

    // 7) save the collection
    const result = await mobileOtp.save();
  } catch (error) {
    return next(new AppError("OTP does not send please try latter.", 500));
  }
};

// filter object

const filterObj = (obj, ...allowedField) => {
  const filterResult = {};

  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) {
      filterResult[el] = obj[el];
    }
  });

  return filterResult;
};

// user signup

exports.signUP = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  sendToken(newUser, 201, res);
});

// user signup via otp

exports.signUpViaOtp = catchAsync(async (req, res, next) => {
  // 1) get the user from the collection
  const user = await User.findOne({ contactNumber: req.body.contactNumber });

  // 2)check if user already exist then send error
  if (user) {
    //   let error = new AppError("User is already exist", 400)

    return next(new AppError("User is already exist", 400));
  }

  // 3) generate the otp
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // 4) send otp to the client

  try {
    const response = await sendSms(otp, req.body.contactNumber, "151337");

    // 5) create the collection
    const mobileOtp = new MobileOtp({
      contactNumber: req.body.contactNumber,
      otp: otp,
    });

    // 6) encrypt the Otp
    mobileOtp.otp = await bcrypt.hash(mobileOtp.otp, 12);

    // 7) save the collection
    const result = await mobileOtp.save();

    // send the res

    res.status(200).json({
      status: "success",
      message: "Otp has send successfully ",
    });
  } catch (error) {
    return next(new AppError(error, 500));
  }
});

// otp verify

exports.otpVerify = catchAsync(async (req, res, next) => {
  // 1) find the contact number inside the Mobiel otp collection
  const otpHoder = await MobileOtp.find({
    contactNumber: req.body.contactNumber,
  });

  // 2) check if the contact no does not exist send error
  if (otpHoder.length === 0)
    return next(new AppError("OTP is expired Or Invalid!"), 400);

  // 3) check very first opt
  const rightOtpFind = otpHoder[otpHoder.length - 1];

  // 4) validata the opt by comparing
  const validOpt = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  // 5) check if contact is not valid or the otp is not valid
  if (rightOtpFind.contactNumber !== req.body.contactNumber || !validOpt) {
    return next(new AppError("OTP is expired Or Invalid!", 400));
  }

  const { data } = req.body;
  // save the user inside databae
  let user = new User({
    contactNumber: req.body.contactNumber,
    email: data.email,
  });

  user = await user.save({ validateBeforeSave: false });

  ////////////////////////////////////////////////////////////////
  //////////-------- Create user profile ----------///////////////
  ///////////////////////////////////////////////////////////////

  const getProfession = data?.profession?.map((curr) => curr?.value);
  const locationData = {
    type: "Point", // Default value for type
    coordinates: data.coordinates, // Default coordinates
    city: data.city,
    state: data.state,
    country: data.country,
  };

  /////////////////////////////////////////////////////////////
  /////---- Create user profession ---- //////////////////////
  ///////////////////////////////////////////////////////////

  const userProfession = await UserProfile.create({
    user: user._id,
    name: data.name,
    proffession: getProfession,
    dob: data.dob,
    location: locationData,
    gender: data.gender,
  });

  // update the user
  await User.findOneAndUpdate(user._id, { userProfile: userProfession._id });

  user = await User.findById(user._id);
  console.log(user);
  //  delete the otp
  await MobileOtp.deleteMany({
    contactNumber: rightOtpFind.contactNumber,
  });

  sendToken(user, 200, res);
});

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// @METHOD         POST
// @ACCESS         PRIVATE
// @URL            /api/v1/user/createUserPassword
// @DESC           create user password

exports.createUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id });

  //check if the role is only user
  if (user.role !== "user") {
    return next(new AppError("Something went rong", 400));
  }

  // check weather password and passwordConfirm is the same
  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      new AppError("Password and PasswordConfirm must be the same", 400)
    );
  }
  // hash the password
  const password = await bcrypt.hash(req.body.password, 12);

  await User.findByIdAndUpdate(
    user._id,
    { password: password, passwordConfirm: undefined },
    { new: true, runValidators: false }
  );

  res.status(200).json({
    status: "success",
    message: "Password created successfully!",
  });
});

///////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// @METHOD         POST
// @URL            /api/v1/user/login
// @ACCESS         PRIVATE
// @DESC           ever users can login from this route

exports.login = catchAsync(async (req, res, next) => {
  const { emailOrContact, password } = req.body;

  // 1) Check if email and password exist

  if (!emailOrContact || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) check if user exist

  const userWithEmail = await User.findOne({ email: emailOrContact }).select(
    "+password"
  );
  const userWithContactNO = await User.findOne({
    contactNumber: emailOrContact,
  }).select("+password");

  if (!userWithEmail && !userWithContactNO) {
    return next(new AppError("Incorrect email or password", 401));
  }

  let user = userWithContactNO || userWithEmail;

  // check if the password is correct
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (user.role === "user") {
    user = await User.findOne({ _id: user._id })
      .populate("userProfile")
      .populate("proffession");
  }
  if (user.role === "business") {
    user = await User.findOne({ _id: user._id }).populate("brandProfile");
  }
  // 3) If everything ok, send token to client

  sendToken(user, 200, res);
});

// login via OTP

exports.loginViaOtp = catchAsync(async (req, res, next) => {
  const { otp, userWithContactNO } = await validateEmailOrContact(req);

  // if user send the email id
  // if (userWithEmail) {
  //   await sendOtpToMailAndSaveToCollection(userWithEmail.email, otp, res, next);

  //   return res.status(200).json({
  //     status: "success",
  //     message: "Otp has send to your Email successfully",
  //   });
  // }

  // if user send the contact number
  if (userWithContactNO) {
    await sendOtpToContactSaveToCollection(
      userWithContactNO.contactNumber,
      otp,
      res,
      next
    );

    // send the res
    return res.status(200).json({
      status: "success",
      message: "Otp has send successfully ",
    });
  }

  return next(new AppError("Email Or contact no does not exist", 400));
});

// login via otp verify
exports.LoginOtpVerify = catchAsync(async (req, res, next) => {
  // get the field from the req.body
  const { emailOrContact, otp } = req.body;

  // find the contact number inside the Mobile otp collection
  const mobileOtpHoder = await MobileOtp.find({
    contactNumber: emailOrContact,
  });

  // find the contact number inside the email otp collection
  const emailOtpHolder = await EmailOtp.find({
    email: emailOrContact,
  });

  // check if the contact no does not exist send error
  if (mobileOtpHoder.length === 0 && emailOtpHolder.length === 0) {
    return next(new AppError("Opt is Expired", 400));
  }

  if (emailOtpHolder.length > 0) {
    //  check very first otp
    const rightOtpFind = emailOtpHolder[emailOtpHolder.length - 1];

    // validate the otp by comparing
    const validOpt = await bcrypt.compare(otp, rightOtpFind.otp);

    // check if contact is not valid or the otp is not valid
    if (rightOtpFind.email !== emailOrContact || !validOpt) {
      return next(new AppError("Invalid Otp", 400));
    }

    //  check if user allready exist in user colloction
    let user = await User.findOne({ email: emailOrContact });

    if (!user) {
      return next(new AppError("User does not exist", 400));
    }

    //  delete the opt
    await EmailOtp.deleteMany({
      email: rightOtpFind.email,
    });

    // populate the data according to the user role
    if (user.role === "user") {
      user = await User.findOne({ _id: user._id })
        .populate("userProfile")
        .populate("proffession");
    }
    if (user.role === "business") {
      user = await User.findOne({ _id: user._id }).populate("brandProfile");
    }

    sendToken(user, 200, res);
    return;
  }

  if (mobileOtpHoder.length > 0) {
    //  check very first otp
    const rightOtpFind = mobileOtpHoder[mobileOtpHoder.length - 1];

    // validata the otp by comparing
    const validOpt = await bcrypt.compare(otp, rightOtpFind.otp);

    // check if contact is not valid or the otp is not valid
    if (rightOtpFind.contactNumber !== emailOrContact || !validOpt) {
      return next(new AppError("Invalid Otp", 401));
    }

    //  check if user allready exist in user colloction
    let user = await User.findOne({ contactNumber: emailOrContact });
    if (!user) {
      return next(new AppError("User does not exist", 401));
    }

    //  delete the opt
    await MobileOtp.deleteMany({
      contactNumber: rightOtpFind.contactNumber,
    });

    // populate the data according to the user role
    if (user.role === "user") {
      user = await User.findOne({ _id: user._id })
        .populate("userProfile")
        .populate("proffession");
    }

    if (user.role === "business") {
      user = await User.findOne({ _id: user._id }).populate("brandProfile");
    }

    sendToken(user, 200, res);
    return;
  }

  next(new AppError("Invalid Email or contact", 401));
});

//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

// @ROUTE       /user/logout
// @METHOD      POST
// @DESC        Logout user
// @ACCESS      public

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logout successfully",
  });
});

// route protection

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies.jwt;
  }

  // token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // grant access to protected route
  req.user = freshUser;

  next();
});

// roles and permision

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //  roles ["admin", "business"]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

// forget password

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { otp, userWithContactNO } = await validateEmailOrContact(req);

  // if user send the email id
  // if (userWithEmail) {
  //   await sendOtpToMailAndSaveToCollection(userWithEmail.email, otp, res, next);

  //   return res.status(200).json({
  //     status: "success",
  //     message: "Otp has send to your Email successfully",
  //   });
  // }

  // if user send the contact number
  if (userWithContactNO) {
    await sendOtpToContactSaveToCollection(
      userWithContactNO.contactNumber,
      otp,
      res,
      next
    );

    // send the res
    return res.status(200).json({
      status: "success",
      message: "Otp has send successfully ",
    });
  }

  return next(new AppError("Email Or contact no does not exist", 400));
});

// exports.forgetPassword = catchAsync(async (req, res, next) => {
//   //  1) Get user based on posted email
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new AppError("There is no user with email address.", 404));
//   }

//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();

//   await user.save({ validateBeforeSave: false });

//   //  3) Send it to user's email
//   const resetURL = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n if
//   you didn't forget your password, please ignore this email!`;
//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 min)",
//       message,
//     });

//     res.status(200).json({
//       status: "succes",
//       message: "Token send to your email",
//     });
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError("There was an error sending the email, Try again later", 500)
//     );
//   }
// });

// verify the forget password otp

exports.forgetPasswordOtpVerify = catchAsync(async (req, res, next) => {
  // get the field from the req.body
  const { emailOrContact, otp } = req.body;

  // find the contact number inside the Mobile otp collection
  const mobileOtpHoder = await MobileOtp.find({
    contactNumber: emailOrContact,
  });

  // find the contact number inside the email otp collection
  const emailOtpHolder = await EmailOtp.find({
    email: emailOrContact,
  });

  // check if the contact no does not exist send error
  if (mobileOtpHoder.length === 0 && emailOtpHolder.length === 0) {
    return next(new AppError("Opt is Expired", 400));
  }

  if (emailOtpHolder.length > 0) {
    //  check very first otp
    const rightOtpFind = emailOtpHolder[emailOtpHolder.length - 1];

    // validate the otp by comparing
    const validOpt = await bcrypt.compare(otp, rightOtpFind.otp);

    // check if contact is not valid or the otp is not valid
    if (rightOtpFind.email !== emailOrContact || !validOpt) {
      return next(new AppError("Invalid Otp", 400));
    }

    //  check if user allready exist in user colloction
    let user = await User.findOne({ email: emailOrContact });
    if (!user) {
      return next(new AppError("User does not exist", 400));
    }

    user.verifyForgetPassOtp = true;
    await user.save({ validateBeforeSave: false });

    //  delete the opt
    await EmailOtp.deleteMany({
      email: rightOtpFind.email,
    });

    // sendToken(user, 200, res);

    return res.status(200).json({
      status: "success",
      message: "Otp verified successfully!",
    });
  }

  if (mobileOtpHoder.length > 0) {
    //  check very first otp
    const rightOtpFind = mobileOtpHoder[mobileOtpHoder.length - 1];

    // validata the otp by comparing
    const validOpt = await bcrypt.compare(otp, rightOtpFind.otp);

    // check if contact is not valid or the otp is not valid
    if (rightOtpFind.contactNumber !== emailOrContact || !validOpt) {
      return next(new AppError("Invalid Otp", 401));
    }

    //  check if user allready exist in user colloction
    let user = await User.findOne({ contactNumber: emailOrContact });
    if (!user) {
      return next(new AppError("User does not exist", 401));
    }
    user.verifyForgetPassOtp = true;
    await user.save({ validateBeforeSave: false });

    //  delete the opt
    await MobileOtp.deleteMany({
      contactNumber: rightOtpFind.contactNumber,
    });

    // sendToken(user, 200, res);
    return res.status(200).json({
      status: "success",
      message: "Otp verified successfully!",
    });
  }

  next(new AppError("Invalid Email or contact", 401));
});

// reset password

exports.resetPassword = catchAsync(async (req, res, next) => {
  // token based reset password
  // 1) Get user based on the token
  // const hashedToken = crypto
  //   .createHash("sha256")
  //   .update(req.params.token)
  //   .digest("hex");

  // let user = await User.findOne({
  //   passwordResetToken: hashedToken,
  //   passwordResetExpires: { $gte: Date.now() },
  // }).select("+password");

  // 2) If token has not expired, and there is user, set the new password
  // if (!user) {
  //   return next(new AppError("Token is invalid or has expired", 400));
  // }
  // user.passwordResetToken = undefined;
  // user.passwordResetExpires = undefined;

  // OTP based reset password

  // get the field from the req.body
  const { emailOrContact } = req.body;

  // find the contact number inside the Mobile otp collection
  const userContactBased = await User.findOne({
    contactNumber: emailOrContact,
  })
    .select("+password")
    .select("+verifyForgetPassOtp");

  // find the contact number inside the email otp collection
  const userEmailBased = await User.findOne({
    email: emailOrContact,
  })
    .select("+password")
    .select("+verifyForgetPassOtp");

  // check if the contact no does not exist send error
  if (!userContactBased && !userEmailBased) {
    return next(new AppError("Opt is Expired", 400));
  }

  // if user reset password with email
  if (userEmailBased && userEmailBased.verifyForgetPassOtp) {
    // 3) Update changedPasswordAt property for the user
    userEmailBased.password = req.body.password;
    userEmailBased.passwordConfirm = req.body.passwordConfirm;
    userEmailBased.verifyForgetPassOtp = false;
    await userEmailBased.save();

    // 4) Log the user in, send JWT

    // sendToken(userEmailBased, 200, res);
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully!",
    });
  }
  // if user reset password with contact no
  if (userContactBased && userContactBased.verifyForgetPassOtp) {
    // 3) Update changedPasswordAt property for the user
    userContactBased.password = req.body.password;
    userContactBased.passwordConfirm = req.body.passwordConfirm;
    userContactBased.verifyForgetPassOtp = false;
    await userContactBased.save();

    // 4) Log the user in, send JWT

    // sendToken(userContactBased, 200, res);
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully!",
    });
  }

  return next(new AppError("Invalid credential", 401));
});

// update the user password

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) get the user from the collection

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(
      new AppError("there is an error accure.Please try again latter", 400)
    );
  }

  // 2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wront", 401));
  }

  // 3) if so then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) log user in, send jwt

  sendToken(user, 200, res);
});

// Update the current logged in user data

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posted password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword"
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Delete the user

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// brand sign up

exports.brandSignUP = catchAsync(async (req, res, next) => {
  // destructure the email and contactNumber form req.body
  const { email, contactNumber } = req.body;

  // check if email and contact number is correct
  if (!email || !contactNumber) {
    return next(
      new AppError("Please provide your Email Address and Contact Number", 400)
    );
  }
  const userWithEmail = await User.findOne({ email });
  const userWithContact = await User.findOne({ contactNumber });

  if (userWithContact || userWithEmail) {
    return next(
      new AppError(
        "User already Exist. Please try with another credential",
        400
      )
    );
  }

  // generate the Email otp
  // const emailOtp = otpGenerator.generate(6, {
  //   digits: true,
  //   lowerCaseAlphabets: false,
  //   upperCaseAlphabets: false,
  //   specialChars: false,
  // });
  // generate the contact number otp
  const contactOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // if user send the email id

  // await sendOtpToMailAndSaveToCollection(email, emailOtp, res, next);

  // if user send the contact number

  await sendOtpToContactSaveToCollection(contactNumber, contactOtp, res, next);

  res.status(200).json({
    status: "success",
    message: "Otp has been send successfully",
  });
});

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// @METHOD       POST
// @URL          /api/v1/user/sendOtpToContact
// @ACCESS       PRIVATE
// @DESC         if otp is not send then send otp to contact again

exports.sendOtpToContact = catchAsync(async (req, res, next) => {
  // destructure the email and contactNumber form req.body
  const { contactNumber } = req.body;

  // check if email and contact number is correct
  if (!contactNumber) {
    return next(new AppError("Please provide your Contact Number", 400));
  }

  const userWithContact = await User.findOne({ contactNumber });

  if (userWithContact) {
    return next(
      new AppError(
        "User already Exist. Please try with another credential",
        400
      )
    );
  }

  // generate the contact number otp
  const contactOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // if user send the contact number

  await sendOtpToContactSaveToCollection(contactNumber, contactOtp, res, next);

  res.status(200).json({
    status: "success",
    message: "Otp has been send to your provided Contact Number",
  });
});

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// @METHOD       POST
// @URL          /api/v1/user/sendOtpToEmail
// @ACCESS       PRIVATE
// @DESC         if otp is not send then send otp to Email again

exports.sendOtpToEmail = catchAsync(async (req, res, next) => {
  // destructure the email and contactNumber form req.body
  const { email } = req.body;

  // check if email and contact number is correct
  if (!email) {
    return next(new AppError("Please provide your Email Address", 400));
  }
  const userWithEmail = await User.findOne({ email });

  if (userWithEmail) {
    return next(
      new AppError(
        "User already Exist. Please try with another credential",
        400
      )
    );
  }

  // generate the Email otp
  const emailOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // if user send the email id

  await sendOtpToMailAndSaveToCollection(email, emailOtp, res, next);

  res.status(200).json({
    status: "success",
    message: "Otp has been send to your provided Email Adddress",
  });
});

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

//  brand sign up otp verify
exports.brandSignUPOtpVerify = catchAsync(async (req, res, next) => {
  // get the field from the req.body
  const { email, contactNumber, emailOtp, contactNumberOtp } = req.body;

  // find the contact number inside the Mobile otp collection
  const mobileOtpHoder = await MobileOtp.find({
    contactNumber: contactNumber,
  });

  // find the contact number inside the email otp collection
  // const emailOtpHolder = await EmailOtp.find({
  //   email: email,
  // });

  // check if the contact no does not exist send error
  // if (mobileOtpHoder.length === 0 && emailOtpHolder.length === 0) {
  //   return next(new AppError("Opt is Expired", 400));
  // }
  if (mobileOtpHoder.length === 0) {
    return next(new AppError("Opt is Expired", 400));
  }

  //  check very first Email otp
  // const rightEmailOtpFind = emailOtpHolder[emailOtpHolder.length - 1];

  // check very first contact otp
  const rightContactOtpFind = mobileOtpHoder[mobileOtpHoder.length - 1];

  // validate the Email otp by comparing
  // const validEmailOpt = await bcrypt.compare(emailOtp, rightEmailOtpFind.otp);

  // validata the contact otp by comparing
  const validContactOpt = await bcrypt.compare(
    contactNumberOtp,
    rightContactOtpFind.otp
  );

  // check if contact is not valid or the otp is not valid
  // if (
  //   rightEmailOtpFind.email !== email ||
  //   !validEmailOpt ||
  //   rightContactOtpFind.contactNumber !== contactNumber ||
  //   !validContactOpt
  // ) {
  //   return next(new AppError("Invalid Otp", 400));
  // }
  if (rightContactOtpFind.contactNumber !== contactNumber || !validContactOpt) {
    return next(new AppError("Invalid Otp", 400));
  }

  //  check if user allready exist in user colloction
  let userNoProfile = new User({
    contactNumber: contactNumber,
    email: email,
    verifyBusinessOtp: true,
    role: "business",
  });

  userNoProfile = await userNoProfile.save({ validateBeforeSave: false });
  const brandSlug = req.body.brandName.trim().split(" ").join("-");
  const brandProfile = await BrandProfile.create({
    user: userNoProfile._id,
    brandName: req.body.brandName,
    brandNameSlug: brandSlug,
    registeredAs: req.body.registeredAs,
    industry: req.body.industry,
    location: JSON.parse(req.body.location),
  });

  let user = await User.findByIdAndUpdate(
    brandProfile.user,
    { brandProfile: brandProfile._id },
    {
      new: true,
      validateBeforeSave: false,
    }
  ).populate("brandProfile");

  //  delete the opt
  // await EmailOtp.deleteMany({
  //   email: rightEmailOtpFind.email,
  // });

  //  delete the opt
  await MobileOtp.deleteMany({
    contactNumber: rightContactOtpFind.contactNumber,
  });

  sendToken(user, 200, res);
});

// brand create paass and profile

exports.brandPassAndProfile = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(
      new AppError("Password and confirm password must be the same", 400)
    );
  }

  // update the password to user document

  let userFind = await User.findById(req.user.id).select("+verifyBusinessOtp");
  // check otp is verified
  if (!userFind.verifyBusinessOtp) {
    return next(new AppError("Please verify your otp"));
  }

  // hash the password
  const hashPass = await bcrypt.hash(password, 12);

  //  create password
  const user = await User.findByIdAndUpdate(
    userFind._id,
    {
      password: hashPass,
      passwordConfirm: undefined,
    },
    { new: true, runValidators: false }
  );

  res.status(201).json({
    status: "success",
    message: "Password created successfully!",
  });
});

// @ROUTE           /api/v1/user
// @METHOD          PATCH
// @DESC            update the user email or contact
// @ACCESS          PRIVATE

exports.updateContactInfo = catchAsync(async (req, res, next) => {
  // get the user Id
  const userId = req.user.id;

  // destructure the field
  const { email, contactNumber } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      email,
      contactNumber,
    },
    { new: true, runValidators: true }
  ).populate("brandProfile");

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
