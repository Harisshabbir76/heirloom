require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');

const cookieParser = require('cookie-parser');
const checkoutRoutes = require('./routes/checkoutRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Connect to Database
connectDB();


// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://heirloom-two-lake.vercel.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error Handler (Simple)

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
