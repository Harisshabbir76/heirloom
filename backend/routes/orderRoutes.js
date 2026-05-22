const express = require('express');
const router = express.Router();
const {
  createOrder,
  createCheckoutSession,
  verifyCheckoutSession,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.post('/checkout-session', createCheckoutSession);
router.get('/checkout-session/:sessionId', verifyCheckoutSession);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
