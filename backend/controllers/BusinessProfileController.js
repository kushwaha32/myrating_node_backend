const BrandProfile = require("../models/brandProfileModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.updateBusinessProfile = catchAsync(async (req, res, next) => {
  // get the userId
  const userId = req.user.id;

  // assing the image if exists
  let profileImg;
  if (req.file) {
    profileImg = req.file.filename;
  }
  const { brandName, registeredAs, location, industry } = req.body;

  const upLocation = JSON.parse(location);

  const brandPfo = await BrandProfile.findOne({ user: userId });
  const brandSlug = brandName.trim().split(" ").join("-");
  await BrandProfile.findByIdAndUpdate(
    brandPfo._id,
    {
      brandName,
      brandNameSlug: brandSlug,
      brandImage: profileImg,
      registeredAs,
      industry,
      location: {
        coordinates: [upLocation.coordinates[0], upLocation.coordinates[1]],
        address: upLocation.address,
        type: "Point",
      },
    },
    { new: true, runValidators: true }
  );

  const user = await User.findOne({ _id: userId }).populate("brandProfile");

  res.status(200).json({
    status: "success",
    message: "Brand profile updated successfully!",
    data: {
      user,
    },
  });
});







/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/:brandSlug
// Method          GET
// Desc            get the brand pased on the slug
// Access          PUBLIC


exports.getSingleBrand = catchAsync(async(req, res) => {
        
        const brandProfile = await BrandProfile.findOne({brandNameSlug: req.params.brandSlug})
        
        res.status(200).json({
          status: "succcess",
          data: {
            brandProfile
          }
        })
})