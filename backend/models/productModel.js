const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Please provide the Profile Name"],
      uniuqe: true,
      minlength: 3,
      lowercase: true,
    },
    productNameSlug: {
      type: String,
      required: [true, "Please provide the Profile Name"],
      uniuqe: true,
      minlength: 3,
      lowercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustrySubCategory",
    },
    bio: {
      type: String,
      required: [true, "Plase provide the bio of the Profile"],
    },
    proifleImg: {
      type: String,
      required: [true, "Please provide the profile image"],
    },
    location: {
      // GeoJson
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
        required: [true, "please provide the location"],
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    totalLikes: {
      type: Number,
      min: 0,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      default: 1,
    },
    nRating: {
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

// setting the index
productSchema.index({ location: "2dsphere" });

productSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }).populate("subCategory");
  next();
});

// virtual populate review
productSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "product",
  localField: "_id",
});

// virtual populate likes
productSchema.virtual("likes", {
  ref: "Like",
  foreignField: "product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
