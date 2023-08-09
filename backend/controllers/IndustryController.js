const Industry = require("../models/industryModel");
const catchAsync = require("../utils/catchAsync");

///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @MEHTOD           GET
// @URL              /api/v1/industry
// @ACCESS           PUBLIC
// @DESC             get all the industry

exports.getAllIndustry = catchAsync(async (req, res, next) => {
  // query for all the awailable industry
  const industry = await Industry.find().sort({name: 1}).populate("subCategory");

  //   send the all the awailable industry to the res
  res.status(200).json({
    status: "success",
    size: industry.length,
    data: {
      industry,
    },
  });
});

////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// @METHOD                POST
// @URL                   /api/v1/industry
// @DESC                  Create a new industry
// @ACCESS                PRIVATE

exports.createIndustry = catchAsync(async (req, res) => {
  const { name } = req.body;

  //   generate the slug based on name
  const slug = name.trim().split(" ").join("-");

  // create the new industry
  const newIndustry = await Industry.create({ name, slug });

  //   send the created industry to the res
  res.status(200).json({
    status: "success",
    data: {
      newIndustry,
    },
  });
});
