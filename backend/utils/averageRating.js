const Product = require("../models/productModel");


const averageRating = async function () {
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
            averageRating: 1,
          });
        }
      };


module.exports = averageRating;