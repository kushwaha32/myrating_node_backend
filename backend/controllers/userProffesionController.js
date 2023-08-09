const UserProffession = require("../models/userProffessionModel");
const catchAsync = require("../utils/catchAsync");

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// @METHOD      GET
// @URL         /api/v1/proffession
// @DESC        gives all the proffession
// @ACCESS      PUBLIC

exports.getProffession = catchAsync(async (req, res, next) => {
  const profession = await UserProffession.find().sort({ proffession: 1 });

  res.status(200).json({
    status: "success",
    data: {
      data: profession,
    },
  });
});

//////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// @METHOD     POST
// @URL        /api/v1/proffession
// @DESC       create proffession
// @ACCESS     PRIVATE only admin can access

exports.createProffession = catchAsync(async (req, res, next) => {
  const profession = await UserProffession.create({
    proffession: req.body.proffession,
  });

  res.status(201).json({
    status: "success",
    message: "profession created successfully",
    data: {
      data: profession,
    },
  });
});

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// @METHOD          PATCH
// @URL             /api/v1/proffession
// @ACCESS          PRIVATE only admin con use this
// @DESC            admin can update the proffession

exports.updateProffession = catchAsync(async (req, res, next) => {
  const profession = await UserProffession.findByIdAndUpdate(
    req.params.id,
    { proffession: req.body.proffession },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: profession,
    },
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// @METOD            DELETE
// @URL              /api/v1/proffession
// @ACCESS           PRIVATE || only admin can use this route
// @DESC             admin can delete proffession

exports.deleteProffession = catchAsync(async (req, res, next) => {
  await UserProffession.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "succcess",
    message: "proffession is deleted successfully",
  });
});
