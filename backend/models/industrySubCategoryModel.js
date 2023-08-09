const mongoose = require("mongoose");

const industrySubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the sub category name"],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    industry: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Industry",
        required: true,
      },
    ],
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate review
industrySubCategorySchema.virtual("products", {
  ref: "Product",
  foreignField: "subCategory",
  localField: "_id",
});

const IndustrySubCategory = mongoose.model(
  "IndustrySubCategory",
  industrySubCategorySchema
);

module.exports = IndustrySubCategory;
