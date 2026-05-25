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
  const fullName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(' ');

  const paymentStatus = order.paymentStatus || 'paid';

  const phone =
    contact.phone ||
    contact.mobile ||
    order?.phone ||
    order?.contact?.mobile ||
    'Not provided';

  console.log('ORDER CONTACT:', contact);
  console.log('PHONE:', phone);

  const productsHtml = (order.items || [])
    .map((item) => {
      const name = item.productName || 'Product';
      const qty = item.quantity ?? 0;
      const unit = item.unitPrice ?? 0;
      const giftWrapText = item.giftWrap
        ? ' + Gift Wrap (50 AED)'
        : '';

      const totalPrice =
        (unit + (item.giftWrap ? 50 : 0)) * qty;

      return `
        <div style="display:flex;align-items:center;padding:16px 0;border-bottom:1px solid #f0f0f0;">
          <div style="width:60px;height:60px;background:#f5f5f5;margin-right:16px;overflow:hidden;border-radius:4px;">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${name}" style="width:100%;height:100%;object-fit:cover;" />`
                : '<div style="width:100%;height:100%;background:#e6e2d8;"></div>'
            }
          </div>

          <div style="flex:1;">
            <div style="font-family:Georgia,serif;font-weight:600;font-size:16px;color:#350008;margin-bottom:4px;">
              ${name}
            </div>

            <div style="font-size:12px;color:#666;">
              Quantity: ${qty}${giftWrapText}
            </div>
          </div>

          <div style="font-weight:600;font-size:14px;color:#350008;">
            ${totalPrice} ${order.currency || 'AED'}
          </div>
        </div>
      `;
    })
    .join('');

  const addressParts = [
    contact.address,
    contact.apartment,
    contact.city,
    contact.emirate,
  ].filter(Boolean);

  const addressLine = addressParts.length
    ? addressParts.join(', ')
    : 'N/A';

  return {
    subject: `✨ New Order Received - Heirloom by SK (Order #${order._id
      .toString()
      .slice(-8)})`,

    text: [
      'HEIRLOOM BY SK - NEW ORDER RECEIVED',
      '───────────────────────────────────',
      `Order ID: ${order._id.toString()}`,
      `Payment status: ${paymentStatus}`,
      '',
      `Customer: ${fullName || 'N/A'}`,
      `Email: ${contact.email || 'N/A'}`,
      `Phone: ${phone}`,
      `Address: ${addressLine}`,
      '',
      'Order Summary:',
      '───────────────────────────────────',
      ...(order.items || []).map((item, idx) => {
        const name = item.productName || 'Product';
        const qty = item.quantity ?? 0;
        const unit = item.unitPrice ?? 0;

        const giftWrapText = item.giftWrap
          ? ' (incl. Gift Wrap)'
          : '';

        const totalPrice =
          (unit + (item.giftWrap ? 50 : 0)) * qty;

        return `${idx + 1}. ${name}${giftWrapText} - Qty: ${qty} - ${totalPrice} ${order.currency || 'AED'}`;
      }),
      '',
      '───────────────────────────────────',
      `Subtotal: ${order.subtotal || 0} ${order.currency || 'AED'}`,
      `Total: ${order.total || 0} ${order.currency || 'AED'}`,
    ].join('\n'),

    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - Heirloom by SK</title>
      </head>

      <body style="margin:0;padding:40px 20px;background:#f9f9f9;font-family:Arial,sans-serif;color:#1a1a1a;">

        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;box-shadow:0 4px 12px rgba(0,0,0,0.02);">

          <div style="padding:32px 40px;text-align:center;border-bottom:1px solid #f0f0f0;background:#fffdf7;">
            <h1 style="margin:0;color:#350008;font-size:28px;letter-spacing:2px;">
              Heirloom by SK
            </h1>

            <div style="margin-top:8px;color:#666;">
              Timeless pieces, crafted for generations.
            </div>
          </div>

          <div style="padding:40px;">

            <h2 style="color:#350008;margin-top:0;">
              ✨ New Order Received
            </h2>

            <div style="background:#f5f5f5;padding:12px 16px;margin-bottom:24px;border-left:3px solid #350008;">
              <strong>Order #:</strong>
              ${order._id.toString()}
            </div>

            <table width="100%" style="border-collapse:collapse;margin-bottom:30px;">
              <tr>
                <td style="padding:10px 0;font-weight:600;width:30%;">Customer</td>
                <td style="padding:10px 0;">${fullName || 'N/A'}</td>
              </tr>

              <tr>
                <td style="padding:10px 0;font-weight:600;">Email</td>
                <td style="padding:10px 0;">
                  <a href="mailto:${contact.email || ''}">
                    ${contact.email || 'N/A'}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0;font-weight:600;">Phone</td>
                <td style="padding:10px 0;">
                  ${phone}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0;font-weight:600;">Shipping Address</td>
                <td style="padding:10px 0;">
                  ${addressLine}<br />United Arab Emirates
                </td>
              </tr>
            </table>

            <h3 style="color:#350008;">Order Summary</h3>

            <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
              ${productsHtml}
            </div>

            <div style="margin-top:24px;padding-top:16px;border-top:2px solid #f0f0f0;">
              <div style="display:flex;justify-content:space-between;padding:8px 0;">
                <span>Subtotal</span>
                <span>${order.subtotal || 0} ${order.currency || 'AED'}</span>
              </div>

              <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;color:#350008;border-top:1px solid #f0f0f0;">
                <span>Total</span>
                <span>${order.total || 0} ${order.currency || 'AED'}</span>
              </div>
            </div>

          </div>

          <div style="background:#fafafa;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0;font-size:11px;color:#909090;">
            © ${new Date().getFullYear()} Heirloom by SK. All rights reserved.
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

      console.log(`✅ Order email sent for order ${savedOrder._id}`);
    } catch (emailError) {
      console.error('Failed to send order email:', emailError);
    }
  }

  return {
    order: savedOrder,
    wasAlreadyPaid,
  };
}

module.exports = {
  finalizePaidOrder,
};
