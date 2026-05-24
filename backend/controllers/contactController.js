const nodemailer = require('nodemailer');

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



exports.sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, email, and message',
      });
    }

    const fullName = `${firstName} ${lastName || ''}`.trim();
    const transporter = createMailTransporter();
    
    await transporter.sendMail({
      from: `"Heirloom by SK" <${process.env.EMAIL_USER}>`, // Cleaned up display name
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `[Inquiry] New Message From ${fullName}`,
      text: [
        `HEIRLOOM BY SK - NEW CONTACT INQUIRY`,
        `───────────────────────────────────`,
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        `───────────────────────────────────`,
        `Message:`,
        message,
      ].join('\n'),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Inquiry</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9f9f9;
              color: #1a1a1a;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .email-wrapper {
              max-width: 560px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #eef0f2;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            }
            .email-header {
              padding: 32px 40px;
              border-bottom: 1px solid #f0f0f0;
              text-align: center;
            }
            .email-header h1 {
              font-size: 18px;
              font-weight: 400;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              margin: 0;
              color: #000000;
            }
            .email-body {
              padding: 40px;
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
              font-weight: 600;
              color: #707070;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.08em;
              width: 25%;
              vertical-align: top;
            }
            .value {
              color: #1a1a1a;
              width: 75%;
            }
            .value a {
              color: #1a1a1a;
              text-decoration: underline;
            }
            .divider {
              border-top: 1px solid #f0f0f0;
              margin: 20px 0;
            }
            .message-heading {
              font-size: 11px;
              font-weight: 600;
              color: #707070;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 12px;
            }
            .message-content {
              font-size: 14px;
              line-height: 1.7;
              color: #2b2b2b;
              background-color: #fcfcfc;
              border: 1px solid #f5f5f5;
              padding: 20px;
              white-space: pre-wrap;
            }
            .email-footer {
              background-color: #fafafa;
              padding: 24px 40px;
              text-align: center;
              border-top: 1px solid #f0f0f0;
            }
            .email-footer p {
              font-size: 12px;
              color: #909090;
              margin: 0;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>

          <div class="email-wrapper">
            <div class="email-header">
              <h1>Heirloom by SK</h1>
            </div>
            
            <div class="email-body">
              <table class="meta-table">
                <tr class="meta-row">
                  <td class="label">Client</td>
                  <td class="value">${fullName}</td>
                </tr>
                <tr class="meta-row">
                  <td class="label">Email</td>
                  <td class="value"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr class="meta-row">
                  <td class="label">Phone</td>
                  <td class="value">${phone || 'Not provided'}</td>
                </tr>
              </table>

              <div class="divider"></div>

              <div class="message-heading">Message / Inquiry</div>
              <div class="message-content">${String(message).replace(/\n/g, '<br />')}</div>
            </div>

            <div class="email-footer">
              <p>© ${new Date().getFullYear()} Heirloom by SK. All rights reserved.</p>
            </div>
          </div>

        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};