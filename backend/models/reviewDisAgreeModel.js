const mongoose = require("mongoose");
const Reviews = require("./reviewModel");

const reviewDisAgreeSchema = new mongoose.Schema(
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

// calculate the total disagree
reviewDisAgreeSchema.statics.calcNdisagree = async function (reviewId) {
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
    await Reviews.findByIdAndUpdate(stats[0]._id, {
      nDisAgree: stats[0].nDisAgree,
    });
  } else {
    // update the total inside the review
    await Reviews.findByIdAndUpdate(stats[0]._id, {
      nDisAgree: stats[0].nDisAgree,
    });
  }
};

// runs after creating the new ReviewDisAgree
reviewDisAgreeSchema.post("save", function () {
  this.constructor.calcNdisagree(this.review);
});

const ReviewDisAgree = mongoose.model("ReviewDisAgree", reviewDisAgreeSchema);

module.exports = ReviewDisAgree;
