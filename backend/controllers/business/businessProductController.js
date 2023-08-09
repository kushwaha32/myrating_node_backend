

const BrandProfile = require("../../models/brandProfileModel");
const Product = require("../../models/productModel");
const APIFeatures = require("../../utils/APIFeatures");
const catchAsync = require("../../utils/catchAsync");


// convert the brand slug the _id

exports.convertSlubToId = catchAsync(async(req, res, next) => {
       if(req.query.slug){
        const brand =  await BrandProfile.find({brandNameSlug: req.query.slug});

        delete req.query.slug
        req.query.user = brand.user
       }

       next();
})


// @ROUTE     /BrandProduct
// METHOD     GET
// DESC       return all brand products

exports.getAllBrandProduct = catchAsync(async (req, res, next) => {
  let query = Product.find();

  // get all the product
  let products = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  products = await products.query;
  // send the res  with all the product
  res.status(200).json({
    status: "success",
    products,
  });
});
