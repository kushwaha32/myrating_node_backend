const mongoose = require("mongoose");
const BusinessReviews = require("./BusinessReviewModel");

const BusinessReviewDisAgreeSchema = new mongoose.Schema(
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

// calculate the total disagree
BusinessReviewDisAgreeSchema.statics.calcNdisagree = async function (reviewId) {
  const stats = await this.aggregate([
    {
      $match: { review: reviewId },
    },
    {
      $group: {
        _id: "$review",
        nDisAgree: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    // update the total inside the review
    await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
      nDisAgree: stats[0].nDisAgree,
    });
  } else {
    // update the total inside the review
    await BusinessReviews.findByIdAndUpdate(stats[0]._id, {
      nDisAgree: stats[0].nDisAgree,
    });
  }
};

// runs after creating the new ReviewDisAgree
BusinessReviewDisAgreeSchema.post("save", function () {
  this.constructor.calcNdisagree(this.review);
});

const BusinessReviewDisAgree = mongoose.model(
  "BusinessReviewDisAgree",
  BusinessReviewDisAgreeSchema
);

module.exports = BusinessReviewDisAgree;
