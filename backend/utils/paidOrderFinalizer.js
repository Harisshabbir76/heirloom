const nodemailer = require('nodemailer');
const Product = require('../models/Product');

function createMailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured in environment variables');
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
  const paymentStatus = order.paymentStatus || 'paid';

  const productsHtml = (order.items || [])
    .map((item, idx) => {
      const name = item.productName || 'Product';
      const qty = item.quantity ?? 0;
      const unit = item.unitPrice ?? 0;
      const giftWrapText = item.giftWrap ? ' + Gift Wrap (50 AED)' : '';
      const totalPrice = (unit + (item.giftWrap ? 50 : 0)) * qty;
      
      return `
        <div style="display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="width: 60px; height: 60px; background-color: #f5f5f5; margin-right: 16px; overflow: hidden; border-radius: 4px;">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />` : '<div style="width: 100%; height: 100%; background-color: #e6e2d8;"></div>'}
          </div>
          <div style="flex: 1;">
            <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 16px; color: #350008; margin-bottom: 4px;">${name}</div>
            <div style="font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; color: #666;">Quantity: ${qty}${giftWrapText}</div>
          </div>
          <div style="font-family: 'Hanken Grotesk', sans-serif; font-weight: 600; font-size: 14px; color: #350008;">${totalPrice} ${order.currency || 'AED'}</div>
        </div>
      `;
    })
    .join('');

  const addressParts = [contact.address, contact.apartment, contact.city, contact.emirate].filter(Boolean);
  const addressLine = addressParts.length ? addressParts.join(', ') : 'N/A';

  return {
    subject: `✨ New Order Received - Heirloom by SK (Order #${order._id.toString().slice(-8)})`,
    text: [
      'HEIRLOOM BY SK - NEW ORDER RECEIVED',
      '───────────────────────────────────',
      `Order ID: ${order._id.toString()}`,
      '',
      `Customer: ${fullName || 'N/A'}`,
      `Email: ${contact.email || 'N/A'}`,
      `Phone: ${contact.phone || 'Not provided'}`,
      `Address: ${addressLine}`,
      '',
      'Order Summary:',
      '───────────────────────────────────',
      (order.items || [])
        .map((item, idx) => {
          const name = item.productName || 'Product';
          const qty = item.quantity ?? 0;
          const unit = item.unitPrice ?? 0;
          const giftWrapText = item.giftWrap ? ' (incl. Gift Wrap)' : '';
          const totalPrice = (unit + (item.giftWrap ? 50 : 0)) * qty;
          return `${idx + 1}. ${name}${giftWrapText} - Qty: ${qty} - ${totalPrice} ${order.currency || 'AED'}`;
        })
        .join('\n'),
      '',
      '───────────────────────────────────',
      `Subtotal: ${order.subtotal || 0} ${order.currency || 'AED'}`,
      `Total: ${order.total || 0} ${order.currency || 'AED'}`,
      '───────────────────────────────────',
      '',
      'This order requires your attention. Please process it in the dashboard.',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - Heirloom by SK</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Hanken+Grotesk:wght@100;200;300;400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            color: #1a1a1a;
            margin: 0;
            padding: 40px 20px;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #eef0f2;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          .email-header {
            padding: 32px 40px;
            border-bottom: 1px solid #f0f0f0;
            text-align: center;
            background-color: #fffdf7;
          }
          .email-header h1 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0;
            color: #350008;
          }
          .email-subtitle {
            font-family: 'Pinyon Script', cursive;
            font-size: 16px;
            color: #666;
            margin-top: 8px;
            font-weight: 400;
          }
          .order-badge {
            display: inline-block;
            background-color: #350008;
            color: #ffffff;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 2px;
            margin-top: 16px;
          }
          .email-body {
            padding: 40px;
          }
          .greeting {
            font-family: 'Cormorant Garamond', serif;
            font-size: 20px;
            font-weight: 600;
            color: #350008;
            margin-bottom: 24px;
          }
          .order-id {
            background-color: #f5f5f5;
            padding: 12px 16px;
            margin-bottom: 24px;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            color: #666;
            border-left: 3px solid #350008;
          }
          .order-id strong {
            color: #350008;
            font-weight: 600;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .meta-row td {
            padding: 10px 0;
            font-size: 14px;
            line-height: 1.6;
          }
          .label {
            font-family: 'Hanken Grotesk', sans-serif;
            font-weight: 600;
            color: #707070;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.08em;
            width: 30%;
            vertical-align: top;
          }
          .value {
            font-family: 'Hanken Grotesk', sans-serif;
            font-weight: 400;
            color: #1a1a1a;
            width: 70%;
          }
          .value a {
            color: #350008;
            text-decoration: underline;
          }
          .divider {
            border-top: 1px solid #f0f0f0;
            margin: 20px 0;
          }
          .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 16px;
            font-weight: 600;
            color: #350008;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 24px 0 16px 0;
          }
          .products-list {
            margin: 16px 0;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            overflow: hidden;
          }
          .totals {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 2px solid #f0f0f0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 14px;
          }
          .total-row.grand-total {
            font-weight: 700;
            font-size: 16px;
            color: #350008;
            border-top: 1px solid #f0f0f0;
            margin-top: 8px;
            padding-top: 12px;
          }
          .action-button {
            display: inline-block;
            background-color: #350008;
            color: #ffffff;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 2px;
            margin-top: 24px;
          }
          .order-note {
            margin-top: 24px;
            padding: 16px;
            background-color: #f9f9f9;
            border-left: 3px solid #350008;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            color: #666;
          }
          .email-footer {
            background-color: #fafafa;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #f0f0f0;
          }
          .email-footer p {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 11px;
            color: #909090;
            margin: 0;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>

        <div class="email-wrapper">
          <div class="email-header">
            <h1>Heirloom by SK</h1>
            <div class="email-subtitle">Timeless pieces, crafted for generations.</div>
            <div class="order-badge">New Order</div>
          </div>
          
          <div class="email-body">
            <div class="greeting">✨ New Order Received</div>
            
            <div class="order-id">
              <strong>Order #:</strong> ${order._id.toString()}
            </div>
            
            <table class="meta-table">
              <tr class="meta-row">
                <td class="label">Customer</td>
                <td class="value">${fullName || 'N/A'}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Email</td>
                <td class="value"><a href="mailto:${contact.email || ''}">${contact.email || 'N/A'}</a></td>
              </tr>
              <tr class="meta-row">
                <td class="label">Phone</td>
                <td class="value">${contact.phone || 'Not provided'}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Shipping Address</td>
                <td class="value">${addressLine}<br />United Arab Emirates</td>
              </tr>
            </table>

            <div class="divider"></div>

            <div class="section-title">Order Summary</div>
            
            <div class="products-list">
              ${productsHtml}
            </div>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${order.subtotal || 0} ${order.currency || 'AED'}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total</span>
                <span>${order.total || 0} ${order.currency || 'AED'}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.DASHBOARD_URL || 'http://localhost:3000/admin/orders'}" class="action-button">
                View in Dashboard
              </a>
            </div>

            <div class="order-note">
              ⚡ This order requires your attention. Please process it in the dashboard to update the status.
            </div>
          </div>

          <div class="email-footer">
            <p>© ${new Date().getFullYear()} Heirloom by SK. All rights reserved.</p>
            <p style="margin-top: 8px; font-size: 10px;">heirloombysk.com</p>
          </div>
        </div>

      </body>
      </html>
    `,
  };
}

async function sendPaidOrderEmail(order) {
  const transporter = createMailTransporter();
  const mail = formatOrderEmail(order);

  await transporter.sendMail({
    from: `"Heirloom by SK" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}

async function deductStockOnce(order) {
  if (order.stockDeductedAt) return;

  await Promise.all(
    (order.items || []).map(async (item) => {
      if (!item?.productId) return;
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) return;

      await Product.findOneAndUpdate(
        { _id: item.productId },
        { $inc: { stock: -qty } },
        { new: true }
      );

      await Product.updateOne(
        { _id: item.productId, stock: { $lt: 0 } },
        { $set: { stock: 0 } }
      );
    })
  );

  order.stockDeductedAt = new Date();
}

async function finalizePaidOrder(order) {
  if (!order) return null;

  const wasAlreadyPaid = order.paymentStatus === 'paid';
  
  order.paymentStatus = 'paid';
  if (!order.paymentConfirmedAt) {
    order.paymentConfirmedAt = new Date();
  }

  await deductStockOnce(order);
  
  let savedOrder = await order.save();

  if (!savedOrder.paidOrderEmailSentAt) {
    try {
      await sendPaidOrderEmail(savedOrder);
      
      savedOrder.paidOrderEmailSentAt = new Date();
      savedOrder = await savedOrder.save();
      console.log(`Email successfully delivered for order reference: ${savedOrder._id}`);
    } catch (emailError) {
      console.error('Failed to dispatch verification mailer securely:', emailError);
    }
  }

  return { order: savedOrder, wasAlreadyPaid };
}

module.exports = {
  finalizePaidOrder,
};