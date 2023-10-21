const multer = require("multer");
const Product = require("../models/productModel");
const IndustrySubCategory = require("../models/industrySubCategoryModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/APIFeatures");
const BrandProfile = require("../models/brandProfileModel");
const SearchedCity = require("../models/searchedCityModel");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../public/image/`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImage = upload.single("image");

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @DESC      Get subCategory id based on slug

exports.getSubCategoryId = catchAsync(async (req, res, next) => {
  if (req.query.hasOwnProperty("subCategorySlug")) {
    const subCat = await IndustrySubCategory.findOne({
      slug: req.query.subCategorySlug,
    });

    delete req.query.subCategorySlug;
    req.query.subCategory = subCat._id;
  }

  next();
});

// @ROUTE     /product
// METHOD     GET
// DESC       return all products

exports.getAllProduct = catchAsync(async (req, res, next) => {
  const newQuery = { ...req.query };
  let brandQuery = BrandProfile.find();

  //  create user searched city history
  if (req.query.hasOwnProperty("city")) {
    await SearchedCity.create({ userIp: req.ip, city: req.query.city });
  }

  // get the brand
  if (req.query.hasOwnProperty("category")) {
    brandQuery = brandQuery.find({ industry: req.query.category });
    delete req.query.category;
  }

  let query = Product.find();
  // build jio json query
  if (req.query.hasOwnProperty("distance")) {
    const distance = req.query.distance;
    const latlng = req.query.latlng;
    const [lat, lng] = latlng.split(",");
    const radius = distance / 6378.1;
    // product query
    query = query.find({
      location: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
    });
    // brand Query
    brandQuery = brandQuery.find({
      location: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
    });

    delete req.query.distance;
    delete req.query.latlng;
  }
  // build the city query
  if (req.query.hasOwnProperty("city")) {
    const distance = req.query.city;
    const regexQuery = new RegExp(distance, "i");
    // product query
    query = query.find({
      $or: [{ "location.address": { $regex: regexQuery } }],
    });
    // brand query
    brandQuery = brandQuery.find({
      $or: [{ "location.address": { $regex: regexQuery } }],
    });
    delete req.query.city;
  }

  // build search field query
  if (req.query.hasOwnProperty("searchField")) {
    const searchField = req.query.searchField;
    const regexQuery = new RegExp(searchField, "i");
    //  product query
    query = query.find({
      $or: [{ productName: { $regex: regexQuery } }],
    });
    //  brand query
    brandQuery = brandQuery.find({
      $or: [{ brandName: { $regex: regexQuery } }],
    });
    delete req.query.searchField;
  }

  // paginate the brandQury
  const page = req.query.page * 1 || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const brand = await brandQuery.skip(skip).limit(limit).populate("user");

  // get all the product
  let products = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  products = await products.query.populate("user").populate("reviews");
  if (Object.keys(newQuery).length > 0) {
    products = [{ products: products, brand: brand }];
  }

  // send the res  with all the product
  res.status(200).json({
    status: "success",
    products,
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE    /product
// METHOD    POST
// DESC      create new product

exports.createProduct = catchAsync(async (req, res, next) => {
  // get user id
  const userId = req.user.id;

  // destruct the product fields from the req.body

  // const productImg = req.file.filename;
  const { productName } = req.body;
  const productNameSlug = productName.split(" ").join("-");

  const product = await Product.create({
    productName: productName,
    productNameSlug: productNameSlug,
    user: userId,
    category: req.body.productCategoryId,
    bio: req.body.description,
    proifleImg: req.body.profileImg,
    location: {
      // GeoJson
      type: "Point",
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
    awardCerRecognition: JSON.stringify(req.body.awardCerRecognition),
    emailId: JSON.stringify(req.body.emailId),
    facebook: JSON.stringify(req.body.facebook),
    hoursOfOperation: JSON.stringify(req.body.hoursOfOperation),
    instagram: JSON.stringify(req.body.instagram),
    isSameAsAdmin: JSON.stringify(req.body.isSameAsAdmin),
    keywords: req.body.keywords,
    landline: JSON.stringify(req.body.landLine),
    mobileNo: JSON.stringify(req.body.mobileNo),
    multiImg: JSON.stringify(req.body.multiImg),
    offer: JSON.stringify(req.body.offer),
    pamentModes: JSON.stringify(req.body.pamentModes),
    stablishmentYear: JSON.stringify(req.body.stablishmentYear),
    tollFreeNo: JSON.stringify(req.body.tollFreeNo),
    twitter: JSON.stringify(req.body.twitter),
    websites: JSON.stringify(req.body.websites),
    youTube: JSON.stringify(req.body.youtube),
  });

  const products = await Product.find().sort("-createdAt");
  // send the response

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: {
      product,
      products,
    },
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE       /product/:id
// @METHOD      GET
// @DESC        return single product based on id

exports.getSingleProduct = catchAsync(async (req, res, next) => {
  // get the product id
  const productId = req.params.productNameSlug;

  // get product based on id
  const product = await Product.findOne({
    productNameSlug: productId,
  });

  // send the response
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE        /product/:id
// @METHOD       PATCH
// DESC          update single product

exports.updateSingleProduct = catchAsync(async (req, res, next) => {
  const upLocation = JSON.parse(req.body.location);

  // get the product id from the params
  const productId = req.params.id;

  // destructure the fields from the req.body
  const { productName, category, bio, image } = req.body;

  const productNameSlug = productName.split(" ").join("-");

  // Check if an image file was uploaded
  let productImg;
  if (image) {
    productImg = image;
  }

  // updating the product
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        productName,
        productNameSlug,
        subCategory: category,
        bio,
        proifleImg: productImg, // Assign the productImg if it exists
        location: {
          coordinates: [upLocation.coordinates[0], upLocation.coordinates[1]],
          address: upLocation.address,
          type: "Point",
        },
      },
    },
    { new: true, runValidators: true }
  );
  const products = await Product.find().sort("-createdAt");
  // send the res with the updated product
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product: updatedProduct,
      products,
    },
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// @ROUTE           /product/:id
// @METHOD          DELETE
// @DESC            delete single product

exports.deleteSingleProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

exports.getToursWithin = catchAsync(async (req, res, next) => {
  // destructure the parameters for the req.params
  const { distance, latlng, unit } = req.params;

  // convert lat and lang into an array & destructure
  const [lat, lng] = latlng.split(",");

  // get the radius in radiun
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  // if invalid lat and lng send error
  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng",
        400
      )
    );
  }

  // doing the geo special query
  const product = await Product.find({
    location: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });

  // send the response
  res.status(200).json({
    status: "Success",
    results: product.length,
    data: {
      data: product,
    },
  });
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

exports.uploadImage = catchAsync(async (req, res, next) => {
  const imageUrl = `${process.env.DEV_APP_URL}/image/${req.file.filename}`;

  res.status(200).json({ url: imageUrl });
});
