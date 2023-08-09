const RegisteredAs = require("../models/registeredAs");
const catchAsync = require("../utils/catchAsync");




//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// @METHOD         GET
// @ROUTE          /api/v1/registeredAs
// @ACCESS         PUBLIC
// @DESC           return all the registered As

exports.getRegisteredAs = catchAsync(async(req, res) => {
    const registeredAs = await RegisteredAs.find().sort({name: 1});

    res.status(200).json({
        status: "success",
        size: registeredAs.length,
        data: {
            registeredAs
        }
    })
})



//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

// @METHOD         POST
// @ROUTE          /api/v1/createRegisteredAs
// @ACCESS         PRIVATE
// @DESC           create new RegisteredAs

exports.createRegisteredAs = catchAsync(async(req, res) => {
     const {name} = req.body;

     const createdRegisteredAs = await RegisteredAs.create({ name });

     res.status(201).json({
        status: "success",
        size: createdRegisteredAs.length,
        data: {
          registeredAs: createdRegisteredAs
        }
     })
})
