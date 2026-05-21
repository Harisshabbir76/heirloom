const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
});

const variantOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: imageSchema, // Optional image for this specific option
  dimensions: {
    length: String,
    width: String,
    height: String,
    description: String,
  },
  price: { type: Number },
});

const variantGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Size" or "Design"
  options: [variantOptionSchema],
  hasVariantPrice: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  basePrice: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'AED',
  },
  images: [imageSchema],
  variantGroups: [variantGroupSchema], // Grouped variants
  stock: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

productSchema.path('variantGroups').validate(function (groups) {
  if (!Array.isArray(groups)) return true;
  const pricedGroups = groups.filter((group) => group.hasVariantPrice);
  return pricedGroups.length <= 1;
}, 'Only one variant group can have variant pricing.');

module.exports = mongoose.model('Product', productSchema);
