const Like = require("../models/likeModel");
const Product = require("../models/productModel");


const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");







//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @METHOD            GET
// @ROUTE             /product/:productId/like
// @DESC              create a new review

exports.getReview = catchAsync(async(req, res, next) => {
      if(!req.body.product) req.body.product = req.params.productId
    
      const product = await Product.findOne({productNameSlug: req.body.product})
      const likes = await Like.find({product: product._id});
    

      res.status(200).json({
        status: "success",
        data:{
          likes
        }
      })
})




/////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// @METOD          POST
// @ROUTE          /product/:productId/like
// @DESC           create a new reivew

exports.createLike = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;

  // check whether user already has given the rating
  const like = await Like.findOne({
    user: req.user.id,
    product: req.body.product,
  });

  // Give error if user allready has give the like
  if (like) {
    return next(new AppError("You can not give multiple like to same product"));
  }

  // create like
  let newLike = await Like.create({
    user: req.user.id,
    product: req.body.product,
  });

  newLike = await newLike.save();
  newLike = await newLike.populate("product");
  
  const likes = await Like.find({ product: req.body.product }).populate({
    path: "product",
    select: "productNameSlug",
  });
  
  // send response
  res.status(201).json({
    status: "success",
    data: {
      likes
    },
  });
});

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// @ROUTE          /product/:productId/like
// @METHOD         DELETE
// @DESC           deduct one like from the product

exports.deleteLike = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;

  //  get the like with user id and product id
  const like = await Like.findOne({
    product: req.body.product,
    user: req.user.id,
  });

  // remove the like
  await Like.findByIdAndDelete(like._id);


  // send response
  const likes = await Like.find({ product: req.body.product }).populate({
    path: "product",
    select: "productNameSlug",
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

  const favorites = await Like.find({ user: userId }).populate("product");
  
  res.status(200).json({
    status: "success",
    length: favorites.length,
    data: {
      favorites,
    },
  });
});
