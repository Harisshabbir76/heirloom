const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';


function createMailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function formatOrderEmail(order) {
  const contact = order?.contact || {};
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');

  const productsText = (order.items || [])
    .map((item, idx) => {
      const name = item.productName || 'Product';
      const qty = item.quantity ?? 0;
      const unit = item.unitPrice ?? 0;
      return `${idx + 1}. ${name} — Qty: ${qty} — Unit price: ${unit} ${order.currency || 'AED'}`;
    })
    .join('\n');

  const addressParts = [contact.address, contact.apartment, contact.city, contact.emirate].filter(Boolean);
  const addressLine = addressParts.length ? addressParts.join(', ') : 'N/A';

  return {
    subject: `New order received (ID: ${order._id.toString()})`,
    text: [
      'A new order has been placed.',
      '',
      `Order ID: ${order._id.toString()}`,
      '',
      `Customer: ${fullName || 'N/A'}`,
      '',
      `Email: ${contact.email || 'N/A'}`,
      '',
      `Address: ${addressLine}`,
      '',
      'Products:',
      '',
      productsText || 'N/A',
      '',
    ].join('\n'),
    html: `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${order._id.toString()}</p>
      <p><strong>Customer:</strong> ${fullName || 'N/A'}</p>
      <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
      <p><strong>Address:</strong> ${addressLine}</p>
      <h3>Products</h3>
      <pre style="white-space: pre-wrap; font-family: inherit;">${productsText || 'N/A'}</pre>
    `,
  };
}

async function sendNewOrderEmail(order) {
  try {
    const transporter = createMailTransporter();
    const mail = formatOrderEmail(order);

    await transporter.sendMail({
      from: `"Heirloom By SK" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  } catch (emailError) {
    console.error('Failed to send new order email:', emailError);
  }
}

// Ensure token is configured
function getZiinaToken() {
  const token = process.env.ZIINA_ACCESS_TOKEN;
  if (!token) {
    throw new Error('ZIINA_ACCESS_TOKEN is not configured in backend environment variables');
  }
  return token;
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

    await sendNewOrderEmail(order);

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

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Error retrieving order by intent ID:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
