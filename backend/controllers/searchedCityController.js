const SearchedCity = require("../models/searchedCityModel");
const catchAsync = require("../utils/catchAsync");

///////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// @METHOD         GET
// @ROUTE          /api/v1/searchCity
// @ACCESS         PUBLIC
// @DESC           Gives user searched result

exports.getSearchCity = catchAsync(async (req, res) => {
  const searchCity = await SearchedCity.find({userIp: req.ip}).sort("-createdAt").limit(5);

  res.status(200).json({
    status: "success",
    data: {
      searchCity,
    },
  });
});
