const catchAsync = require("../utils/catchAsync");
const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");

////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// @METHOD       GET
// @ROUTE        /api/v1/profile
// @ACCESS       PRIVATE
// @DESC         only authenticate user con get their profile info

exports.getUserProfile = catchAsync(async (req, res, next) => {
  // get the user by their id
  const userInfo = await UserProfile.findOne({ user: req.user.id });

  // send the response
  res.status(200).json({
    status: "success",
    data: userInfo,
  });
});

///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @METHOD      POST
// @ROUTE       /api/v1/profile
// @ACCESS      PRIVATE
// @DESC        only authenticate user can create profile

exports.createUserProfile = catchAsync(async (req, res, next) => {

  let profileImg;
  if (req.file) {
    profileImg = req.file.filename;
  }
  // create the profile
  const userProfile = await UserProfile.create({
    user: req.user.id,
    name: req.body.name,
    proffession: req.body.proffession,
    dob: req.body.dob,
    location: JSON.parse(req.body.location),
    gender: req.body.gender,
    userImg: profileImg,
  });
  // update user profile id in user model
  let user = await User.findByIdAndUpdate(
    userProfile.user,
    { userProfile: userProfile._id, proffession: userProfile.proffession },
    { new: true, runValidators: true }
  )
    .populate("userProfile")
    .populate("proffession");

  // send the response

  res.status(201).json({
    status: "successs",
    data: { user },
  });
});

/////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// @METHOD              PATCH
// @ROUTE               /api/v1/profile
// @ACCESS              PRIVATE
// @DESC                only authenticate user can update profile

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  let profileImg;
  if (req.file) {
    profileImg = req.file.filename;
  }

  const upLocation = JSON.parse(req.body.location);
   
  //   update the authenticate user profile
  let updatedUserProfile = await UserProfile.findByIdAndUpdate(
    profile._id,
    {
      name: req.body.name,
      proffession: req.body.proffession,
      dob: req.body.dateOfBirth,
      location: {
        coordinates: [upLocation.coordinates[0], upLocation.coordinates[1]],
        address: upLocation.address,
        type: "Point",
      },
      gender: req.body.gender,
      userImg: profileImg,
    },
    { new: true, runValidators: true }
  );
  console.log(updatedUserProfile);
  const user = await User.findOne({ _id: req.user.id })
    .populate("userProfile")
    .populate("proffession");

  res.status(200).json({
    status: "success",
    message: "Profile updated successfull",
    data: {user},
  });
});


