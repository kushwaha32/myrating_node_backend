const Reviews = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const APIFeatures = require("../utils/APIFeatures");
const BusinessReviews = require("../models/BusinessReviewModel");
const BrandProfile = require("../models/brandProfileModel");

//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// @DESC          calculating the average rating

const calculateAverageRating = async (productId) => {
  const stats = await Reviews.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  // update the average rating in product
  if (stats.length === 0) {
    return await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      nRating: 0,
    });
  }
  return await Product.findByIdAndUpdate(stats[0]._id, {
    averageRating: stats[0].averageRating,
    nRating: stats[0].nRating,
  });
};

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// @DESC             calculating the peaches

const calcPeaches = async (userId) => {
  // get the user
  const ownerUser = await User.findById(userId);
  if (!ownerUser) {
    return;
  }
  // update the pitches
  await User.findByIdAndUpdate(ownerUser._id, {
    peaches: ownerUser.peaches + 1,
  });
  return;
};

////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// @DESC         deduct peaches

const deductPeaches = async (userId, peaches) => {
  await User.findByIdAndUpdate(userId, { peaches: peaches - 1 });
  return;
};

// convert product slug to product id

exports.convertProductSlug = catchAsync(async (req, res, next) => {
  if (req.query.hasOwnProperty("productSlug")) {
    const product = await Product.findOne({
      productNameSlug: req.query.productSlug,
    });

    req.query.productId = product._id;
    req.query.product = product._id;
    delete req.query.productSlug;
  }

  next();
});

////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// @ROUTE     /review || /brandProfile/:brandProfileId/review
// @METHOD    GET
// @DESC      get all the reviews

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.brandProfileId)
    filter = { product: req.params.brandProfileId };

  if (req.params.brandNameSlug) {
    const brandProfile = await BrandProfile.findOne({
      brandNameSlug: req.params.brandNameSlug,
    });

    filter = { brandProfile: brandProfile._id };
  }

  let reviews;
  // fetching all the reviews
  if (Object.keys(req.query).length !== 0) {
    delete req.query.brandProfileId;
    const brandProfile = await BrandProfile.findOne({
      brandNameSlug: req.query.businessProfile,
    });
    req.query.businessProfile = brandProfile._id;
    reviews = new APIFeatures(BusinessReviews.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    reviews = await reviews.query;

    return res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }

  reviews = await BusinessReviews.find(filter).sort("-createdAt");

  // sending the res
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE          /brandReview || /brandProfile/:brandSlug/brandReview
// @METHOD         POST
// @DESC           create a new review

exports.createReview = catchAsync(async (req, res, next) => {
  //   Allow nested routes
  if (!req.body.brandProfile) req.body.brandProfile = req.params.brandSlug;

  // set the user
  req.body.user = req.user.id;

  // destructure the body data
  const { brandProfile, review, rating, user } = req.body;
  // get brandProfile id
  const getBrandProfile = await BrandProfile.findOne({
    brandNameSlug: brandProfile,
  });

  // get the user if allready given the reating
  const getReview = await BusinessReviews.findOne({
    user,
    businessProfile: getBrandProfile._id,
  });

  // check if user given the rating
  if (getReview) {
    return next(
      new AppError("You cannot give the multiple rating to same product")
    );
  }

  // creating the new review
  const newReview = await BusinessReviews.create({
    user: req.user.id,
    businessProfile: getBrandProfile._id,
    review,
    rating,
    reviewImg: JSON.stringify(req.body.reviewImg ? req.body.reviewImg : []),
  });

  // populate the created review with product
  const populatedReview = await newReview.populate("businessProfile");

  // get the _id of owner of the product who create the product
  const productOwner = populatedReview.businessProfile.user;
  // update the product owner peaches

  //   if (productOwner && rating > 0) {
  //     await calcPeaches(productOwner);
  //   }

  // // get the _id owner of the review who created the review
  const reviewOwner = populatedReview.user;

  // update the review owner peaches
  if (rating > 0) {
    await calcPeaches(reviewOwner);
  }
  console.log(getBrandProfile);
  const reviews = await BusinessReviews.find({
    businessProfile: getBrandProfile._id,
  })
    .populate("user")
    .sort("-createdAt");
  const profile = await BrandProfile.find()
    .populate("businessReview")
    .sort("-createdAt");
  const reviewedUser = await User.findOne({ _id: req.user.id });

  // send the response
  res.status(201).json({
    status: "success",
    data: {
      review: reviews,
      profile,
      user: reviewedUser,
    },
  });
});

////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE       /brandReview/:reviewId || /brandProfile/:bradProfileId/brandReview/:reviewId
// @METHOD      PATCH
// @DESC        update a review

exports.updateReview = catchAsync(async (req, res, next) => {
  if (!req.body.reviewId) req.body.reviewId = req.params.reviewId;
  if (!req.body.currentBrand)
    req.body.currentBrand = req.params.brandProfileSlug;

  const findOneObj = {
    _id: req.body.reviewId,
    businessProfile: req.body.currentBrand,
    user: req.user.id,
  };

  const update = {
    review: req.body.review,
    rating: req.body.rating,
    reviewImg: JSON.stringify(req.body.reviewImg),
  };

  // find one review with _id, product, current auth user
  const findedReview = await BusinessReviews.findOne(findOneObj);

  // find by id and update
  const updatedReview = await BusinessReviews.findByIdAndUpdate(
    findedReview._id,
    update,
    {
      new: true,
      runValidators: true,
    }
  );

  // calc the updated average rating
  //   await calculateAverageRating(updatedReview.product._id);

  const reviews = await BusinessReviews.find({
    businessProfile: req.body.currentBrand,
  })
    .populate("user")
    .sort("-createdAt");
  const products = await BrandProfile.find()
    .populate("businessReview")
    .sort("-createdAt");

  // send the response
  res.status(200).json({
    status: "success",
    data: {
      review: reviews,
      products,
    },
  });
});

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// @ROUTE        /brandReview/:reviewId  || /brandProfile/:bradProfileId/brandReview/:reviewId
// @METHOD       DELETE
// @DESC         delete the review

exports.deleteReview = catchAsync(async (req, res, next) => {
  if (!req.body.reviewId) req.body.reviewId = req.params.reviewId;
  if (!req.body.currentBrand)
    req.body.currentBrand = req.params.brandProfileSlug;

  let user = req.user.id;

  const findOneObj = {
    _id: req.body.reviewId,
    currentBrand: req.body.currentBrand,
    user,
  };

  // find one review by review id, product id and user id
  const findedReview = await BusinessReviews.findOne(findOneObj);

  // delete the review by review id
  await BusinessReviews.findByIdAndDelete(findedReview._id);

  // calc the updated average rating
  await calculateAverageRating(findedReview.businessProfile._id);

  const reviews = await BusinessReviews.find({
    businessProfile: req.body.currentBrand,
  }).populate("user");
  const products = await BrandProfile.find().populate("businessReview");
  const reviewedUser = await User.findOne({ _id: req.user.id });
  res.status(200).json({
    status: "success",
    data: {
      review: reviews,
      products,
      user: reviewedUser,
    },
  });
});

// ROUTE        /brandReview/avgRating || /brandProfile/:brandSlug/brandReview/avgRating
// METHOD       GET
// DESC         gives the average ratings of product

exports.avgRatingBrandProfile = catchAsync(async (req, res) => {
  // get the brandProfile
  const brandProfile = await BrandProfile.findOne({
    brandNameSlug: req.params.brandSlug,
  }).select("_id");

  const stats = await BusinessReviews.aggregate([
    { $match: { businessProfile: brandProfile._id } },

    {
      $group: {
        _id: "$businessProfile",
        avgRating: { $avg: "$rating" },
        nRating: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        businessProfile: "$_id",
        avgRating: "$avgRating",
        nRating: "$nRating",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      avgRating: stats,
    },
  });
});

// ROUTE         /brandReview/rDistribution || /brandProfile/:brandSlug/brandReview/rDistribution
// METHOD        GET
// DESCRIPTION   get the rating distribution

exports.rDistribution = catchAsync(async (req, res) => {
  // get the brand profile
  const brandProfile = await BrandProfile.findOne({
    brandNameSlug: req.params.brandSlug,
  });

  const stats = await BusinessReviews.aggregate([
    { $match: { businessProfile: brandProfile._id } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        count: 1,
        rating: "$_id",
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      rDistribution: stats,
    },
  });
});
