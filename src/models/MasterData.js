const mongoose = require('mongoose');

/**
 * Generic lookup/master-data model for small, fixed dropdown lists
 * (Title, Outcome, Sex, Primary Report Type, etc.) — as opposed to
 * Product, which has 1000+ records and needs search + pagination.
 *
 * One collection, many categories: category='title', category='outcome', ...
 */
const masterDataSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true, // fast lookup by category
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// A given value should only appear once per category
masterDataSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('MasterData', masterDataSchema);
