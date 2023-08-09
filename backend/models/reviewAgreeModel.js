const mongoose = require("mongoose");
const Reviews = require("./reviewModel");

const reviewAgreeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviews",
    },
  },
  { timestamps: true }
);

// calculating the total disagree
reviewAgreeSchema.statics.calcNagree = async function (reviewId) {
  const stats = await this.aggregate([
    {
      $match: { review: reviewId },
    },
    {
      $group: {
        _id: "$review",
        nAgree: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    // update the TOTAL inside review
    await Reviews.findByIdAndUpdate(stats[0]._id, {
      nAgree: stats[0].nAgree,
    });
  } else {
    // update the TOTAL inside review
    await Reviews.findByIdAndUpdate(stats[0]._id, {
      nAgree: stats[0].nAgree,
    });
  }
};

// runs after creating the new ReviewAgree
reviewAgreeSchema.post("save", function () {
  this.constructor.calcNagree(this.review);
});

const ReviewAgree = mongoose.model("ReviewAgree", reviewAgreeSchema);

module.exports = ReviewAgree;
