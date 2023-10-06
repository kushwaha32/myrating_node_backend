const BusinessReviews = require("../models/BusinessReviewModel");
const BusinessReviewAgree = require("../models/businessReviewAgreeModel");
const BusinessReviewDisAgree = require("../models/businessReviewDisagreeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

/////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

// @DESC          calculating the total agree

const calculateTotalAgree = async (reviewId) => {
  const stats = await BusinessReviewAgree.aggregate([
    {
      $match: { review: reviewId },
    },
    {
      $group: {
        _id: "$review",
        nAgree: { $sum: 1 },
      },
    },
  ]);

  // update the average rating in product
  if (stats.length === 0) {
    return await BusinessReviews.findByIdAndUpdate(reviewId, {
      nAgree: 0,
    });
  }
  return await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
    nAgree: stats[0].nAgree,
  });
};

// @DESC          calculating the total disagree

const calculateTotalDisAgree = async (reviewId) => {
  const stats = await BusinessReviewDisAgree.aggregate([
    {
      $match: { review: reviewId },
    },
    {
      $group: {
        _id: "$review",
        nDisAgree: { $sum: 1 },
      },
    },
  ]);

  // update the average rating in product
  if (stats.length === 0) {
    return await BusinessReviews.findByIdAndUpdate(reviewId, {
      nDisAgree: 0,
    });
  }
  return await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
    nDisAgree: stats[0].nDisAgree,
  });
};

//////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// @MEHTOD              POST
// @ROUTE               /api/v1/reviewAgree
// @DESC                create new reviewAgree
// @ACCESS              PRIVATE

exports.createReviewAgree = catchAsync(async (req, res, next) => {
  // chech if user already agreed
  const previousAgree = await BusinessReviewAgree.findOne({
    review: req.body.review,
    user: req.user.id,
  });

  if (previousAgree) {
    return next(new AppError("You allready agreed", 400));
  }

  const newAgree = await BusinessReviewAgree.create({
    review: req.body.review,
    user: req.user.id,
  });

  // check if user allready disagreed
  const checkDisAgree = await BusinessReviewDisAgree.findOne({
    review: req.body.review,
    user: req.user.id,
  });

  if (checkDisAgree) {
    await BusinessReviewDisAgree.findByIdAndDelete(checkDisAgree._id);
    await calculateTotalDisAgree(req.body.review);

    return res.status(201).json({
      status: "success",
      data: {
        agree: 1,
        disAgree: -1,
      },
    });
  }

  res.status(201).json({
    status: "success",
    data: {
      agree: 1,
      disAgree: 0,
    },
  });
});

//////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// @MEHTOD              POST
// @ROUTE               /api/v1/reviewDisAgree
// @DESC                create new reviewDisAgree
// @ACCESS              PRIVATE

exports.createReviewDisAgree = catchAsync(async (req, res, next) => {
  // chech if user already agreed
  const previousAgree = await BusinessReviewDisAgree.findOne({
    review: req.body.review,
    user: req.user.id,
  });
  if (previousAgree) {
    return next(new AppError("You allready disagreed", 400));
  }

  const newAgree = await BusinessReviewDisAgree.create({
    review: req.body.review,
    user: req.user.id,
  });

  // check if user allready agreed
  const checkAgree = await BusinessReviewAgree.findOne({
    review: req.body.review,
    user: req.user.id,
  });
  if (checkAgree) {
    await BusinessReviewAgree.findByIdAndDelete(checkAgree._id);
    await calculateTotalAgree(req.body.review);

    return res.status(201).json({
      status: "success",
      data: {
        agree: -1,
        disAgree: 1,
      },
    });
  }

  res.status(201).json({
    status: "success",
    data: {
      agree: 0,
      disAgree: 1,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// METHOD          GET
// ROUTE           /api/v1/review/:reviewId/review-agree
// ACCESS          PUBLIC
// DESC            Return all reviewAgree based on review id

exports.getAllReviewAgree = catchAsync(async (req, res, next) => {
  const reviewAgree = await BusinessReviewAgree.find({
    review: req.params.reviewId,
  });

  res.status(200).json({
    status: "success",
    data: {
      reviewAgree,
    },
  });
});

////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// METHOD             GET
// ROUTE              /api/v1/review/:reviewId/BusinessReviewDisAgree
// DESC               Returns all the ReviewDisAgree based on the review
// ACCESS             PUBLIC

exports.getAllReviewDisAgree = catchAsync(async (req, res, next) => {
  const reviewDisAgree = await BusinessReviewDisAgree.find({
    review: req.params.reviewId,
  });

  res.status(200).json({
    status: "success",
    data: {
      reviewDisAgree,
    },
  });
});
