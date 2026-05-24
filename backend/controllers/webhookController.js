const crypto = require('crypto');
const Order = require('../models/Order');

// Ziina webhook source IP address allowlist
const ZIINA_ALLOWED_IPS = [
  '3.29.184.186',
  '3.29.190.95',
  '20.233.47.127',
  '13.202.161.181',
];

/**
 * Validates whether the incoming webhook request is sent from an authorized Ziina IP.
 */
function isValidWebhookSource(req) {
  // If not running in production, bypass IP filtering to allow local testing (e.g. ngrok, local curl)
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  let clientIp = '';

  if (forwardedFor) {
    // Extract first client IP address in case of a proxy chain (e.g. "client, proxy1, proxy2")
    clientIp = forwardedFor.split(',')[0].trim();
  } else {
    clientIp = req.socket.remoteAddress || '';
  }

  // Normalize IPv6 mapping of IPv4 address
  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.substring(7);
  }

  return ZIINA_ALLOWED_IPS.includes(clientIp);
}

/**
 * Validates the HMAC-SHA256 signature header if a webhook secret is configured.
 */
function verifySignature(req) {
  const secret = process.env.ZIINA_WEBHOOK_SECRET;
  if (!secret) {
    // If webhook secret is not configured, skip signature check (development fallback)
    return true;
  }

  const headerSignature = req.headers['x-hmac-signature'];
  if (!headerSignature) {
    return false;
  }

  if (!req.rawBody) {
    console.error('Webhook payload error: req.rawBody is missing. Ensure express.json verification middleware is active.');
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  // Time-constant comparison to protect against timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, 'hex'),
    Buffer.from(headerSignature, 'hex')
  );
}

/**
 * Processes incoming webhook POST request from Ziina.
 */
exports.handleZiinaWebhook = async (req, res) => {
  try {
    // 1. Verify that the request comes from an allowed Ziina IP address
    if (!isValidWebhookSource(req)) {
      const forwardedFor = req.headers['x-forwarded-for'];
      const remoteIp = req.socket.remoteAddress;
      console.warn(`Unauthorized webhook attempt rejected. IP: ${forwardedFor || remoteIp}`);
      return res.status(403).json({ success: false, message: 'Forbidden: IP address not allowed.' });
    }

    // 2. Perform HMAC signature check (if configured)
    if (!verifySignature(req)) {
      console.warn('Webhook signature verification failed.');
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid signature.' });
    }

    const { event, data } = req.body;
    console.log(`Received Ziina webhook event: ${event}`);

    // 3. Listen for the specific payment status updated event
    if (event === 'payment_intent.status.updated') {
      if (!data || !data.id || !data.status) {
        return res.status(400).json({ success: false, message: 'Invalid payload structure.' });
      }

      const paymentIntentId = data.id;
      const paymentStatus = data.status;

      console.log(`Payment Intent ${paymentIntentId} status updated to: ${paymentStatus}`);

      // 4. Update the order in the database if the status is "completed"
      if (paymentStatus === 'completed') {
        const order = await Order.findOne({ ziinaPaymentIntentId: paymentIntentId });

        if (!order) {
          console.warn(`No order found in database matching payment intent ID: ${paymentIntentId}`);
          return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const Product = require('../models/Product');

        // Decrease stock based on purchased quantities (never below 0)
        await Promise.all(
          (order.items || []).map(async (item) => {
            if (!item?.productId) return;
            const qty = Number(item.quantity) || 0;
            if (qty <= 0) return;

            // Atomically decrease stock
            await Product.findOneAndUpdate(
              { _id: item.productId },
              { $inc: { stock: -qty } },
              { new: true }
            );

            // Clamp to 0 if it went negative
            await Product.updateOne(
              { _id: item.productId, stock: { $lt: 0 } },
              { $set: { stock: 0 } }
            );
          })
        );

        order.paymentStatus = 'paid';
        await order.save();

        // Send email to EMAIL_USER with customer and product details (no payment status)
        try {
          const nodemailer = require('nodemailer');
          if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
          }

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });

          const contact = order?.contact || {};
          const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
          const addressParts = [contact.address, contact.apartment, contact.city, contact.emirate].filter(Boolean);
          const addressLine = addressParts.length ? addressParts.join(', ') : 'N/A';

          const productsText = (order.items || [])
            .map((item, idx) => {
              const name = item.productName || 'Product';
              const qty = item.quantity ?? 0;
              const unit = item.unitPrice ?? 0;
              return `${idx + 1}. ${name} — Qty: ${qty} — Unit price: ${unit} ${order.currency || 'AED'}`;
            })
            .join('\n');

          const mail = {
            from: `"Heirloom By SK" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New order processed (ID: ${order._id.toString()})`,
            text: [
              'An order has been successfully paid.',
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
              <h2>New Order Processed</h2>
              <p><strong>Order ID:</strong> ${order._id.toString()}</p>
              <p><strong>Customer:</strong> ${fullName || 'N/A'}</p>
              <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
              <p><strong>Address:</strong> ${addressLine}</p>
              <h3>Products</h3>
              <pre style="white-space: pre-wrap; font-family: inherit;">${productsText || 'N/A'}</pre>
            `,
          };

          await transporter.sendMail(mail);
        } catch (emailError) {
          console.error('Failed to send paid-order email:', emailError);
        }

        console.log(`Order ${order._id.toString()} successfully marked as Paid/Fulfillable.`);
        return res.status(200).json({ success: true, message: 'Order marked as paid.' });
      } else if (paymentStatus === 'failed') {
        // Optionally update database state to failed
        const order = await Order.findOne({ ziinaPaymentIntentId: paymentIntentId });
        if (order) {
          order.paymentStatus = 'failed';
          await order.save();
          console.log(`Order ${order._id.toString()} marked as Failed.`);
        }
        return res.status(200).json({ success: true, message: 'Order marked as failed.' });
      }

      return res.status(200).json({ success: true, message: `Status ${paymentStatus} acknowledged.` });
    }

    // Acknowledge other event types to satisfy Ziina's retry system
    return res.status(200).json({ success: true, message: 'Event received and ignored.' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
