const mongoose = require("mongoose");

const industrySchemea = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the industry name"],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IndustrySubCategory",
      },
    ],
  },
  { timestamps: true }
);

industrySchemea.pre(/^find/, function (next) {
  this.populate("subCategory");

  next();
});

const Industry = mongoose.model("Industry", industrySchemea);

module.exports = Industry;
