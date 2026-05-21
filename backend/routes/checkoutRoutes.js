const express = require('express');
const router = express.Router();
const { createPaymentIntent, getOrderByIntent } = require('../controllers/checkoutController');

router.post('/create-intent', createPaymentIntent);
router.get('/order-by-intent/:intentId', getOrderByIntent);

module.exports = router;
