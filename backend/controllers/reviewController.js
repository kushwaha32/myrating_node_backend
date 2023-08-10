const { mongoose } = require("mongoose");
const Reviews = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const APIFeatures = require("../utils/APIFeatures");

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

// @ROUTE     /review || /product/:productId/review
// @METHOD    GET
// @DESC      get all the reviews

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };

  if (req.params.productSlug) {
    const product = await Product.findOne({
      productNameSlug: req.params.productSlug,
    });

    filter = { product: product._id };
  }

  let reviews;
  // fetching all the reviews
  if (Object.keys(req.query).length !== 0) {
    delete req.query.productId;
    reviews = new APIFeatures(Reviews.find(), req.query)
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

  reviews = await Reviews.find(filter).sort("-createdAt");

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

// @ROUTE          /review || /product/:productId/review
// @METHOD         POST
// @DESC           create a new review

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;

  // set the user
  req.body.user = req.user.id;

  // destructure the body data
  const { product, review, rating, user, rateAs } = req.body;

  // get the user if allready given the reating
  const getReview = await Reviews.findOne({ user, product });

  // check if user given the rating
  if (getReview) {
    return next(
      new AppError("You cannot give the multiple rating to same product")
    );
  }

  // creating the new review
  const newReview = await Reviews.create({
    user: req.user.id,
    product,
    review,
    rating,
    ratingAs: rateAs,
  });

  // populate the created review with product
  const populatedReview = await newReview.populate("product");

  // get the _id of owner of the product who create the product
  const productOwner = populatedReview.product.user;
  // update the product owner peaches

  if (productOwner && (rating > 0)) {
    await calcPeaches(productOwner);
  }

  // // get the _id owner of the review who created the review
  const reviewOwner = populatedReview.user;

  // update the review owner peaches
  if(rating > 0)
  {
    await calcPeaches(reviewOwner);
  }
  

  const reviews = await Reviews.find({ product })
    .populate("user")
    .sort("-createdAt");
  const products = await Product.find().populate("reviews").sort("-createdAt");
  const reviewedUser = await User.findOne({ _id: req.user.id });

  // send the response
  res.status(201).json({
    status: "success",
    data: {
      review: reviews,
      products,
      user: reviewedUser,
    },
  });
});

////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE       /review/:reviewId || /product/:productId/review/:reviewId
// @METHOD      PATCH
// @DESC        update a review

exports.updateReview = catchAsync(async (req, res, next) => {
  if (!req.body.reviewId) req.body.reviewId = req.params.reviewId;
  if (!req.body.product) req.body.product = req.params.productSlug;

  const findOneObj = {
    _id: req.body.reviewId,
    product: req.body.product,
    user: req.user.id,
  };

  const update = {
    review: req.body.review,
    rating: req.body.rating,
    ratingAs: req.body.rateAs,
  };

  // find one review with _id, product, current auth user
  const findedReview = await Reviews.findOne(findOneObj);

  // find by id and update
  const updatedReview = await Reviews.findByIdAndUpdate(
    findedReview._id,
    update,
    {
      new: true,
      runValidators: true,
    }
  );

  // calc the updated average rating
  await calculateAverageRating(updatedReview.product._id);

  const reviews = await Reviews.find({ product: req.body.product })
    .populate("user")
    .sort("-createdAt");
  const products = await Product.find().populate("reviews").sort("-createdAt");

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

// @ROUTE        /review/:reviewId  || /product/:productId/review/reviewId
// @METHOD       DELETE
// @DESC         delete the review

exports.deleteReview = catchAsync(async (req, res, next) => {
  if (!req.body.reviewId) req.body.reviewId = req.params.reviewId;
  if (!req.body.product) req.body.product = req.params.productSlug;

  let user = req.user.id;

  const findOneObj = {
    _id: req.body.reviewId,
    product: req.body.product,
    user,
  };

  // find one review by review id, product id and user id
  const findedReview = await Reviews.findOne(findOneObj);

  // check if user has peaches >= 0
  if (findedReview.user.peaches <= 0) {
    return next(
      new AppError("You don't have any peaches to delete the review")
    );
  }

  // delete the review by review id
  await Reviews.findByIdAndDelete(findedReview._id);

  // calc the updated average rating
  await calculateAverageRating(findedReview.product._id);

  // get product owner
  const productOwner = await findedReview.product.populate("user");

  // deduct product owner peaches by 1
  if (productOwner.user) {
    await deductPeaches(productOwner.user._id, productOwner.user.peaches);
  }

  // deduct review owner peaches by 1
  await deductPeaches(findedReview.user._id, findedReview.user.peaches);

  const reviews = await Reviews.find({ product: req.body.product }).populate(
    "user"
  );
  const products = await Product.find().populate("reviews");
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
