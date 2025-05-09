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
  if (req.body.image) {
    profileImg = req.body.image;
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
  if (req.body.image) {
    profileImg = req.body.image;
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

  const user = await User.findOne({ _id: req.user.id })
    .populate("userProfile")
    .populate("proffession");

  res.status(200).json({
    status: "success",
    message: "Profile updated successfull",
    data: { user },
  });
});

// METHOD              PATCH
// ROUTE               api/v1/profile/updateProfileImg
// ACCESS              PRIVATE
// DESC                update user profile image

exports.updateUserProfileImage = catchAsync(async (req, res) => {
  await UserProfile.findByIdAndUpdate(req.body.id, {
    userImg: req.body.image,
  });

  res.status(200).json({
    status: "success",
    message: "Profile image uploaded successfully!",
  });
});

// METHOD              PATCH
// ROUTE               api/v1/profile/updateDocumentId
// ACCESS              PRIVATE
// DESC                update the document id

exports.updateDocumentId = catchAsync(async (req, res) => {
  await UserProfile.findByIdAndUpdate(req.body.id, {
    verificationId: JSON.stringify({
      documentType: req.body.documentType,
      idDocument: req.body.idDocument,
    }),
    selfiImg: req.body.selfiImg,
    submitVerification: true,
  });

  res.status(200).json({
    status: "success",
    message: "Document Id uploaded successfully!",
  });
});

// METHOD              PATCH
// ROUTE               api/v1/profile/updatePrifilePrivacy
// ACCESS              PRIVATE
// DESC                update the Profile Privacy

exports.updateProfilePrivacy = catchAsync(async (req, res) => {
  console.log(req.body);
  await UserProfile.findByIdAndUpdate(req.body.id, {
    agreeAndDisAgreeOnReview: req.body.agreeAndDisAgreeOnReview,
    allowPersonalizeAdds: req.body.allowPersonalizeAdds,
    allowToSearchMyAccount: req.body.allowToSearchMyAccount,
    newOffers: req.body.newOffers,
    nonPersonalizedAdd: req.body.nonPersonalizedAdd,
    plateFormUpdateAnnounce: req.body.plateFormUpdateAnnounce,
    preferences: req.body.preferences,
    proPrivacy: req.body.proPrivacy,
    reviewAndVisibility: req.body.reviewAndVisibility,
    shareLocationToNearProfile: req.body.shareLocationToNearProfile,
  });

  res.status(200).json({
    status: "success",
    message: "Profile privacy updated successfully!",
  });
});
