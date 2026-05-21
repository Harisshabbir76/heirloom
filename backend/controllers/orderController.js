const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const Order = require('../models/Order');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function isAdminRequest(req) {
  const token = req.cookies?.auth_token;
  const adminEmail = String(process.env.DASHBOARD_ACCESS_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!token || !adminEmail || !process.env.JWT_SECRET) return false;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return String(payload.email || '').trim().toLowerCase() === adminEmail;
  } catch {
    return false;
  }
}

function rejectNonAdmin(req, res) {
  if (isAdminRequest(req)) return false;
  res.status(404).json({ success: false, message: 'Not found' });
  return true;
}

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, shipping, total, currency, contact } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !contact?.email) {
      return res.status(400).json({ success: false, message: 'Order items and email are required' });
    }

    const order = await Order.create({
      items,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      currency: currency || 'AED',
      contact,
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, subtotal, shipping, total, currency, contact, origin } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !contact?.email) {
      return res.status(400).json({ success: false, message: 'Order items and email are required' });
    }

    const order = await Order.create({
      items,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      currency: currency || 'AED',
      contact,
      paymentStatus: 'pending',
    });

    const stripe = getStripe();
    const checkoutOrigin = origin || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: contact.email,
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: String(item.currency || currency || 'AED').toLowerCase(),
          product_data: {
            name: item.productName + (item.giftWrap ? ' (with Gift Wrapping)' : ''),
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
          unit_amount: Math.round(Number((item.unitPrice || 0) + (item.giftWrap ? 50 : 0)) * 100),
        },
      })).concat(Number(shipping) > 0 ? [{
        quantity: 1,
        price_data: {
          currency: String(currency || 'AED').toLowerCase(),
          product_data: { name: 'Standard Shipping' },
          unit_amount: Math.round(Number(shipping) * 100),
        },
      }] : []),
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${checkoutOrigin}/order?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${checkoutOrigin}/order?payment=cancelled`,
    });

    order.stripeCheckoutSessionId = session.id;
    await order.save();

    return res.status(200).json({ success: true, data: { url: session.url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session id is required' });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await Order.findOne({ stripeCheckoutSessionId: sessionId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      await order.save();
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (rejectNonAdmin(req, res)) return;

    const { status, from, to } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) query.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }
    query.paymentStatus = 'paid';

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (rejectNonAdmin(req, res)) return;

    const { status } = req.body;
    if (!['new', 'in-process', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
