const mongoose = require("mongoose");
const BusinessReviews = require("./BusinessReviewModel");

const BusinessReviewAgreeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessReviews",
    },
  },
  { timestamps: true }
);

// calculating the total disagree
BusinessReviewAgreeSchema.statics.calcNagree = async function (reviewId) {
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
    await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
      nAgree: stats[0].nAgree,
    });
  } else {
    // update the TOTAL inside review
    await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
      nAgree: stats[0].nAgree,
    });
  }
};

// runs after creating the new ReviewAgree
BusinessReviewAgreeSchema.post("save", function () {
  this.constructor.calcNagree(this.review);
});

const BusinessReviewAgree = mongoose.model(
  "BusinessReviewAgree",
  BusinessReviewAgreeSchema
);

module.exports = BusinessReviewAgree;
