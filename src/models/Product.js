const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      index: true, // indexed for fast prefix/regex search
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Compound/text considerations:
// A simple index on productName supports case-insensitive regex search
// reasonably well for "starts with" / "contains" patterns at this scale.
// For much larger datasets, consider a text index or Atlas Search.
productSchema.index({ productName: 1 });

module.exports = mongoose.model('Product', productSchema);
