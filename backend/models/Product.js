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
    required: [true, 'Please add a price'],
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

module.exports = mongoose.model('Product', productSchema);
