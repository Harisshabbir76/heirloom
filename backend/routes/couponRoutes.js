const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');

// Public route - validate coupon
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;