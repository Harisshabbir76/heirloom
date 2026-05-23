const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, productIds, appliesToAllProducts, validUntil, isLifetime } = req.body;

    // Validate discount value for percentage
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%' });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      productIds: appliesToAllProducts ? [] : productIds,
      appliesToAllProducts,
      validUntil: isLifetime ? null : validUntil,
      isLifetime,
    });

    await coupon.save();

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('productIds', 'name');
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('productIds', 'name');
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, productIds, appliesToAllProducts, validUntil, isLifetime, isActive } = req.body;

    // Validate discount value for percentage
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%' });
    }

    // Check if new code already exists (if changing code)
    if (code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
      if (existingCoupon) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (code) coupon.code = code.toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (appliesToAllProducts !== undefined) {
      coupon.appliesToAllProducts = appliesToAllProducts;
      coupon.productIds = appliesToAllProducts ? [] : (productIds || coupon.productIds);
    }
    if (validUntil !== undefined) coupon.validUntil = validUntil;
    if (isLifetime !== undefined) coupon.isLifetime = isLifetime;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate coupon for checkout
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartProductIds } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is no longer active' });
    }

    // Check expiration
    if (!coupon.isLifetime && coupon.validUntil) {
      if (new Date() > new Date(coupon.validUntil)) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
    }

    // Check if coupon applies to cart items
    if (!coupon.appliesToAllProducts && coupon.productIds.length > 0) {
      const hasValidProduct = cartProductIds.some(id => coupon.productIds.some(cpid => cpid.toString() === id));
      if (!hasValidProduct) {
        return res.status(400).json({ success: false, message: 'Coupon does not apply to any items in your cart' });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        appliesToAllProducts: coupon.appliesToAllProducts,
        productIds: coupon.productIds.map(id => id.toString()),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate discount amount
exports.calculateDiscount = (coupon, cartItems) => {
  let applicableItems = cartItems;

  // Filter items that the coupon applies to
  if (!coupon.appliesToAllProducts && coupon.productIds && coupon.productIds.length > 0) {
    applicableItems = cartItems.filter(item =>
      coupon.productIds.some(pid => pid.toString() === item.productId)
    );
  }

  if (applicableItems.length === 0) {
    return 0;
  }

  const applicableSubtotal = applicableItems.reduce((sum, item) => {
    return sum + (item.unitPrice + (item.giftWrap ? 50 : 0)) * item.quantity;
  }, 0);

  if (coupon.discountType === 'percentage') {
    return (applicableSubtotal * coupon.discountValue) / 100;
  } else {
    // Fixed discount - cannot exceed applicable subtotal
    return Math.min(coupon.discountValue, applicableSubtotal);
  }
};