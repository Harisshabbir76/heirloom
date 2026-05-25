const Order = require('../models/Order');
const Product = require('../models/Product');
const { finalizePaidOrder } = require('../utils/paidOrderFinalizer');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';








// Ensure token is configured
function getZiinaToken() {
  const token = process.env.ZIINA_ACCESS_TOKEN;
  if (!token) {
    throw new Error('ZIINA_ACCESS_TOKEN is not configured in backend environment variables');
  }
  return token;
}

async function getZiinaPaymentIntent(paymentIntentId) {
  const token = getZiinaToken();
  const response = await fetch(`https://api-v2.ziina.com/api/payment_intent/${paymentIntentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || 'Unable to verify payment intent with Ziina.');
    error.status = response.status || 502;
    error.details = data;
    throw error;
  }

  return data;
}

function isZiinaPaidStatus(status) {
  return ['completed', 'paid', 'succeeded', 'success'].includes(String(status || '').toLowerCase());
}

/**
 * Creates a pending order in the database and requests a payment intent from Ziina Gateway.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, subtotal, total, currency, contact, operation_id } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!contact || !contact.email) {
      return res.status(400).json({ success: false, message: 'Contact email is required.' });
    }

    if (!operation_id) {
      return res.status(400).json({ success: false, message: 'Client operation ID (UUID) is required.' });
    }

    const requestedQuantities = items.reduce((map, item) => {
      if (!item.productId) return map;
      const productId = String(item.productId);
      const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
      map.set(productId, (map.get(productId) || 0) + quantity);
      return map;
    }, new Map());

    for (const [productId, quantity] of requestedQuantities.entries()) {
      const product = await Product.findById(productId).select('name stock');
      if (!product || typeof product.stock !== 'number' || product.stock <= 0) {
        const item = items.find((cartItem) => String(cartItem.productId) === productId);
        const productName = product?.name || item?.productName || 'This product';
        return res.status(409).json({
          success: false,
          message: `${productName} is out of stock. Please remove it from your cart to proceed.`,
        });
      }

      if (quantity > product.stock) {
        return res.status(409).json({
          success: false,
          message: `${product.name} only has ${product.stock} in stock. Please update your cart to proceed.`,
        });
      }
    }

    const calculatedTotal = Number(total);
    if (isNaN(calculatedTotal) || calculatedTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Valid total order amount is required.' });
    }

    // 1. Create a pending order in our database (shipping removed)
    const order = await Order.create({
      items,
      subtotal: Number(subtotal) || 0,
      shipping: 0,
      total: calculatedTotal,
      currency: currency || 'AED',
      contact,
      paymentStatus: 'pending',
    });

    // 2. Convert standard floating-point order total (e.g. 170.00 AED) to base units (Fils) by multiplying by 100
    const amountInFils = Math.round(calculatedTotal * 100);

    // 3. Prepare payload for Ziina Payment Intent API
    const payload = {
      amount: amountInFils,
      currency_code: 'AED',
      message: 'Order Payment for Heirloom by SK',
      success_url: `${frontendUrl}/checkout/success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      failure_url: `${frontendUrl}/checkout/failed`,
      test: true, // Strictly set to true for sandbox execution
      allow_tips: false,
      operation_id: operation_id,
    };

    const token = getZiinaToken();

    // 4. Request payment intent from Ziina
    const response = await fetch('https://api-v2.ziina.com/api/payment_intent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Ziina API error response:', data);
      return res.status(response.status || 502).json({
        success: false,
        message: data.message || 'Error occurred while creating payment intent with Ziina.',
        details: data,
      });
    }

    // 5. Update order with payment intent ID returned by Ziina
    order.ziinaPaymentIntentId = data.id;
    await order.save();

    // 6. Return generated ID and redirect URL to client frontend
    return res.status(201).json({
      success: true,
      id: data.id,
      redirect_url: data.redirect_url,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves the details of an order from the database by its Ziina payment intent ID.
 */
exports.getOrderByIntent = async (req, res) => {
  try {
    const { intentId } = req.params;
    if (!intentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID is required.' });
    }

    const order = await Order.findOne({ ziinaPaymentIntentId: intentId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for the specified intent.' });
    }

    if (order.paymentStatus !== 'paid') {
      try {
        const paymentIntent = await getZiinaPaymentIntent(intentId);
        const ziinaStatus = paymentIntent?.status || paymentIntent?.data?.status;

        if (isZiinaPaidStatus(ziinaStatus)) {
          const finalized = await finalizePaidOrder(order);
          return res.status(200).json({ success: true, data: finalized.order });
        }

        if (String(ziinaStatus || '').toLowerCase() === 'failed') {
          order.paymentStatus = 'failed';
          await order.save();
          return res.status(402).json({ success: false, message: 'Payment was not successful.' });
        }

        return res.status(202).json({
          success: false,
          message: 'Payment is still being verified. Please wait a moment.',
          paymentStatus: ziinaStatus || order.paymentStatus,
        });
      } catch (verifyError) {
        console.error('Error verifying Ziina payment intent:', verifyError);
        return res.status(202).json({
          success: false,
          message: 'Payment is still being verified. Please wait a moment.',
          paymentStatus: order.paymentStatus,
        });
      }
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Error retrieving order by intent ID:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};