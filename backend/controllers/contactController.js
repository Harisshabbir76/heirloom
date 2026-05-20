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

    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"Heirloom Website" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New contact message from ${firstName} ${lastName || ''}`.trim(),
      text: [
        `Name: ${firstName} ${lastName || ''}`.trim(),
        `Email: ${email}`,
        `Contact No: ${phone || 'Not provided'}`,
        '',
        message,
      ].join('\n'),
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact No:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, '<br />')}</p>
      `,
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
