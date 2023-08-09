const mongoose = require("mongoose");
const Product = require("./productModel");

const likeSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Please provide the product Id"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide the user Id"],
  },
});

// static method :=> called on method
// instance method :=> calls on each instances

likeSchema.statics.calcTotalLikes = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        totalLikes: { $sum: 1 },
      },
    },
  ]);
 
  // update likes into the product
  await Product.findByIdAndUpdate(stats[0]._id, {
    totalLikes: stats[0].totalLikes,
  });
};

likeSchema.post("save", function () {
  this.constructor.calcTotalLikes(this.product);
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
