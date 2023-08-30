const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
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
    ratingAs: {
      type: String,
      required: [true, "Please select the Rating As"],
      enum: ["visitor", "customer", "public"],
      lowercase: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "product",
    select: "productName user",
  }).populate({
    path: "user",
    select: "peaches photo",
  });

  next();
});

reviewSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// calculate average raing using statistics method
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
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
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

// run after updating or deleting the review
//  findByIdAndUpdate
//  findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAverageRating(this.r.product);
// });

const Reviews = mongoose.model("Reviews", reviewSchema);

module.exports = Reviews;
