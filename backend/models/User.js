const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    resetPasswordOtpHash: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

