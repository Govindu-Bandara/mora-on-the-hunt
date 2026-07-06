const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['tshirt', 'bangle'], required: true },
    color: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    images: { type: [String], default: [] },
    currentPrice: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, sortOrder: 1 });

module.exports = mongoose.model('Product', productSchema);
