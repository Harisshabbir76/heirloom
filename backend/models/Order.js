const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: { type: String, required: true },
    imageUrl: String,
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    variantSelections: [
      {
        groupName: String,
        optionName: String,
      },
    ],
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    status: {
      type: String,
      enum: ['new', 'in-process', 'delivered'],
      default: 'new',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
      index: true,
    },
    contact: {
      firstName: String,
      lastName: String,
      address: String,
      apartment: String,
      city: String,
      emirate: String,
      email: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
