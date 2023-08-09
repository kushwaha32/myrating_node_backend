const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

// Route          api/v1/topBrand
// Method         GET
// DESC           get all the top brand
// access         public

exports.getTopBrand = catchAsync(async (req, res, next) => {
  const allBrand = await User.find({ role: "business" }).select(
    "-contactNumber -peaches -role -email"
  ).populate("products");

  res.status(200).json({
    status: "success",
    size: allBrand.length,
    data: {
      topBrand: allBrand,
      
    },
  });
});




