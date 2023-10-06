const mongoose = require("mongoose");
const Product = require("./productModel");

const businessReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "Please provide the rating."],
      min: 1,
      max: 5,
    },
    reviewImg: {
      type: String,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandProfile",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    nAgree: {
      type: Number,
      default: 0,
    },
    nDisAgree: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

businessReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "businessProfile",
    select: "businessProfile user",
  }).populate({
    path: "user",
    select: "peaches photo",
  });

  next();
});

businessReviewSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// calculate average raing using statistics method
businessReviewSchema.statics.calcAverageRating = async function (
  businessProfileId
) {
  const stats = await this.aggregate([
    {
      $match: { businessProfile: businessProfileId },
    },
    {
      $group: {
        _id: "$businessProfile",
        nRating: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    // update the average inside product
    await Product.findByIdAndUpdate(stats[0]._id, {
      nRating: stats[0].nRating,
      averageRating: stats[0].averageRating,
    });
  } else {
    // update the average inside product
    await Product.findByIdAndUpdate(stats[0]._id, {
      nRating: 0,
      averageRating: 0,
    });
  }
};

// runs after creating the new review
businessReviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.businessProfile);
});

// run after updating or deleting the review
//  findByIdAndUpdate
//  findByIdAndDelete
// businessReviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// businessReviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAverageRating(this.r.product);
// });

const BusinessReviews = mongoose.model("BusinessReviews", businessReviewSchema);

module.exports = BusinessReviews;
