const BrandLike = require("../models/brandLikeModel");
const BrandProfile = require("../models/brandProfileModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @METHOD            GET
// @ROUTE             /brandProfile/:brandProfileId/like
// @DESC              create a new review

exports.getLikes = catchAsync(async (req, res, next) => {
  if (!req.body.brandProfile) req.body.brandProfile = req.params.brandProfileId;

  const brandProfile = await BrandProfile.findOne({
    brandNameSlug: req.body.brandProfile,
  });
  const likes = await BrandLike.find({ brandProfile: brandProfile._id });

  res.status(200).json({
    status: "success",
    data: {
      likes,
    },
  });
});

/////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// @METOD          POST
// @ROUTE          /brandProfile/:brandProfileId/like
// @DESC           create a new reivew

exports.createLike = catchAsync(async (req, res, next) => {
  if (!req.body.brandProfile) req.body.brandProfile = req.params.brandProfileId;

  // check whether user already has given the rating
  const like = await BrandLike.findOne({
    user: req.user.id,
    brandProfile: req.body.brandProfile,
  });

  // Give error if user allready has give the like
  if (like) {
    return next(new AppError("You can not give multiple like to same product"));
  }

  // create like
  let newLike = await BrandLike.create({
    user: req.user.id,
    brandProfile: req.body.brandProfile,
  });

  newLike = await newLike.save();
  newLike = await newLike.populate("brandProfile");

  const likes = await BrandLike.find({
    brandProfile: req.body.brandProfile,
  }).populate({
    path: "brandProfile",
    select: "brandNameSlug",
  });

  // send response
  res.status(201).json({
    status: "success",
    data: {
      likes,
    },
  });
});

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// @ROUTE          /brandProfile/:brandProfileId/like
// @METHOD         DELETE
// @DESC           deduct one like from the brandProfile

exports.deleteLike = catchAsync(async (req, res, next) => {
  if (!req.body.brandProfile) req.body.brandProfile = req.params.brandProfileId;

  //  get the like with user id and product id
  const like = await BrandLike.findOne({
    brandProfile: req.body.brandProfile,
    user: req.user.id,
  });

  // remove the like
  await BrandLike.findByIdAndDelete(like._id);

  // send response
  const likes = await BrandLike.find({
    brandProfile: req.body.product,
  }).populate({
    path: "brandProfile",
    select: "brandNameSlug",
  });

  res.status(200).json({
    status: "success",
    data: {
      likes,
    },
  });
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE               /api/v1/like/user?userId=""
// @METHOD              GET
// @ACCESS              PRIVATE
// @DESC                GET users favourites based on users id

exports.getUserFavourites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const favorites = await BrandLike.find({ user: userId }).populate(
    "brandProfile"
  );

  res.status(200).json({
    status: "success",
    length: favorites.length,
    data: {
      favorites,
    },
  });
});
