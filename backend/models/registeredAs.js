const mongoose = require("mongoose");
const slugify = require('slugify');

const registeredAsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide Registered As"]
    },
    slug: {
      type: String,
      unique: true
    },
  },
  { timestamps: true }
);

// Middleware to generate and check uniqueness of the slug
registeredAsSchema.pre('save', async function (next) {
    const instance = this;
  
    // Generate the slug from the title field
    const slug = slugify(instance.name, {
      replacement: '-',
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  
    // Check if the generated slug is unique
    const Model = instance.constructor; // Access the model
    const existingInstance = await Model.findOne({ slug });
    if (existingInstance) {
      // If slug already exists, append a random number to make it unique
      const randomNum = Math.floor(Math.random() * 1000);
      instance.slug = `${slug}-${randomNum}`;
    } else {
      instance.slug = slug; // Use the generated slug if it's unique
    }
  
    next();
  });
  

const RegisteredAs = mongoose.model("RegisteredAs", registeredAsSchema);

module.exports = RegisteredAs;
