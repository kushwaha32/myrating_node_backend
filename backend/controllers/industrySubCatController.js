const Industry = require("../models/industryModel");
const IndustrySubCategory = require("../models/industrySubCategoryModel");
const BrandProfile = require("../models/brandProfileModel");
const catchAsync = require("../utils/catchAsync");

// @METHOD         GET
// @ROUTE          /api/v1/industrySubCat
// @ACCESS         PUBLIC
// @DESC           get the subcat based on industry

exports.getIndustrySubCat = catchAsync(async (req, res) => {
  let industrySubCat;
  if (req.body.industry) {
    industrySubCat = await IndustrySubCategory.find({
      industry: req.body.industry,
    }).sort({ name: 1 });
  } else {
    industrySubCat = await IndustrySubCategory.find().sort({ name: 1 });
  }

  res.status(200).json({
    status: "success",
    data: {
      industrySubCat,
    },
  });
});

//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

// @METHOD          POST
// @ROUTE           /api/v1/industrySubCat
// @ACCESS          PRIVATE
// @DESC            create the industry subcategory

exports.createIndustrySubCat = catchAsync(async (req, res) => {
  const { name, industryArr } = req.body;

  const slug = name.trim().toLowerCase().split(" ").join("-");

  const createdIndurySubCat = await IndustrySubCategory.create({
    name: name.toLowerCase(),
    slug,
    industry: industryArr,
  });

  await Promise.all(
    industryArr.map(async (curr) => {
      const currInductry = await Industry.findOne({ _id: curr });
      await Industry.findByIdAndUpdate(curr, {
        subCategory: [...currInductry.subCategory, createdIndurySubCat._id],
      });
    })
  );
  res.status(200).json({
    status: "success",
    data: {
      createdIndurySubCat,
    },
  });
});

///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @METHOD          GET
// @ROUTE           /api/v1/industrySubCat/hasProduct || /api/v1/industrySubCat/public/hasProduct
// @ACCESS          PRIVATE
// @DESC            Returns the category based on category id

exports.getCategoryIfHasProduct = catchAsync(async (req, res) => {
  let brandProfile;
  if (req.query.slug) {
    brandProfile = await BrandProfile.findOne({ brandNameSlug: req.query.slug })
      .lean()
      .exec();
  } else {
    brandProfile = await BrandProfile.findOne({ user: req.user.id })
      .lean()
      .exec();
  }

  // Manually populate the "products" virtual property for each category
  const populatedCategories = await Promise.all(
    brandProfile.industry.subCategory.map(async (category) => {
      const populatedCategory = await IndustrySubCategory.populate(category, {
        path: "products",
        options: { virtuals: true }, // Specify that virtuals should be populated
      });

      return populatedCategory;
    })
  );

  // Filter out the products created by the authenticated user for each category
  const filterPopulatedProduct = populatedCategories.map((currCat) => {
    const filteredProduct = currCat.products.filter((currPro) =>
      currPro.user.equals(brandProfile.user)
    );

    return { ...currCat, products: filteredProduct };
  });

  res.status(200).json({
    status: "success",
    data: {
      category: filterPopulatedProduct,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// @METHOD            POST
// @URL               /api/v1/:slug
// @ACCESS            PRIVATE
// @DESC              get the products from category

exports.getProductsFromCategory = catchAsync(async (req, res) => {
 
  const category = await IndustrySubCategory.findOne({
    slug: req.params.slug,
  }).populate({ path: "products", options: { virtuals: true } });

  let filteredProduct;
  if (req?.user?.id) {
    filteredProduct = category.products.filter(
      (currPro) => currPro.user == req.user.id
    );
  } else {
    const brand = await BrandProfile.findOne({
      brandNameSlug: req?.query?.brand_slug,
    });
   
    filteredProduct = category.products.filter(
      (currPro) => currPro.user.equals(brand.user)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      products: filteredProduct,
    },
  });
});
