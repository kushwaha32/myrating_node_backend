const BrandProfile = require("../models/brandProfileModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.updateBusinessProfile = catchAsync(async (req, res, next) => {
  // get the userId
  const userId = req.user.id;

  // assing the image if exists
  let profileImg;
  if (req.body.image) {
    profileImg = req.body.image;
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

exports.getSingleBrand = catchAsync(async (req, res) => {
  const brandProfile = await BrandProfile.findOne({
    brandNameSlug: req.params.brandSlug,
  });

  res.status(200).json({
    status: "succcess",
    data: {
      brandProfile,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/user/:userId
// Method          GET
// Desc            get the brand based on userId
// Access          PUBLIC

exports.getSingleBrandFromUser = catchAsync(async (req, res) => {
  const brandProfile = await BrandProfile.findOne({
    user: req.params.userId,
  });

  res.status(200).json({
    status: "succcess",
    data: {
      brandProfile,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/brand-industry
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateBrandIndustry = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      industry: req.body.industry,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "brand industry updated successfully!",
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/location-information
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateLocationInfo = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      location: {
        type: "point",
        coordinates: [req.body.lng, req.body.lat],
        building: req.body.building,
        street: req.body.street,
        landmark: req.body.landmark,
        area: req.body.area,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pinCode: req.body.pinCode,
      },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Location information updated successfully!",
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/contact-information
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateContactInfo = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      mobileNo: JSON.stringify(req.body.mobileNo),
      landLine: JSON.stringify(req.body.landLine),
      tollFreeNo: JSON.stringify(req.body.tollFreeNo),
      emailId: JSON.stringify(req.body.emailId),
      websites: JSON.stringify(req.body.websites),
      youtube: JSON.stringify(req.body.youtube),
      facebook: JSON.stringify(req.body.facebook),
      twitter: JSON.stringify(req.body.twitter),
      instagram: JSON.stringify(req.body.instagram),
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Contact information updated successfully!",
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/other-information
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateOtherInfo = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      description: req.body.description,
      offers: JSON.stringify(req.body.offer),
      awartCerRecognitions: JSON.stringify(req.body.awardCerRecognition),
      pamentModes: JSON.stringify(req.body.pamentModes),
      stablishmentYear: JSON.stringify(req.body.stablishmentYear),
      hoursOfOperation: JSON.stringify(req.body.hoursOfOperation),
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Contact information updated successfully!",
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/keywords
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateKeywords = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      keywords: req.body.keywords,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Contact information updated successfully!",
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/photo-profile
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updatePhotoProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      brandImage: req.body.profileImg,
      multiImg: JSON.stringify(req.body.multiImg),
    },
    { new: true }
  );
  const brandProfile = await BrandProfile.findOne({ _id: user.brandProfile });
  res.status(200).json({
    status: "success",
    message: "Contact information updated successfully!",
    data: {
      brandProfile,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// ROUTE           /api/v1/brandProfile/update/submit-verify
// Method          PATCH
// Desc            get the brand pased on the slug
// Access          PRIVATE

exports.updateSubmitVerify = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  await BrandProfile.findByIdAndUpdate(
    user.brandProfile,
    {
      businessDoc: JSON.stringify(req.body.businessDoc),
      idOfAdmin: JSON.stringify(req.body.idOfAdmin),
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Contact information updated successfully!",
  });
});
