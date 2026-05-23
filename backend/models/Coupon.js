const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    trim: true,
    uppercase: true,
    unique: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please select discount type'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add discount value'],
    min: 0,
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  appliesToAllProducts: {
    type: Boolean,
    default: false,
  },
  validUntil: {
    type: Date,
    default: null,
  },
  isLifetime: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);