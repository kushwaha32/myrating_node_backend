const mongoose = require("mongoose");

const brandLikeSchema = new mongoose.Schema({
  brandProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BrandProfile",
    required: [true, "Please provide the Brand Profile Id"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide the user Id"],
  },
});

// static method :=> called on method
// instance method :=> calls on each instances

// likeSchema.statics.calcTotalLikes = async function (brandProfileId) {
//   const stats = await this.aggregate([
//     {
//       $match: { brandProfile: brandProfileId },
//     },
//     {
//       $group: {
//         _id: "$brandProfile",
//         totalLikes: { $sum: 1 },
//       },
//     },
//   ]);

//   // update likes into the product
//   await BrandProfile.findByIdAndUpdate(stats[0]._id, {
//     totalLikes: stats[0].totalLikes,
//   });
// };

// likeSchema.post("save", function () {
//   this.constructor.calcTotalLikes(this.product);
// });

const BrandLike = mongoose.model("BrandLike", brandLikeSchema);

module.exports = BrandLike;
