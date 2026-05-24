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
const couponRoutes = require('./routes/couponRoutes');

const app = express();

// Connect to Database
connectDB();


// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://heirloom-two-lake.vercel.app",
      "https://heirloombysk.ae"
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
app.use('/api/coupons', couponRoutes);

// Error Handler (Simple)

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// A lightweight health check endpoint for UptimeRobot
const mongoose = require('mongoose'); // or your native mongo client

app.get('/api/health', async (req, res) => {
  try {
    // This forces Node.js to check if the database is responding instantly
    if (mongoose.connection.readyState === 1) {
      return res.status(200).json({ status: "healthy", database: "connected" });
    } else {
      throw new Error("Database disconnected");
    }
  } catch (error) {
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;


// Internal database heartbeat mechanism
setInterval(async () => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            console.log('⚡ Active Production Database Heartbeat Sent.');
        }
    } catch (err) {
        console.error('Database heartbeat check encountered an error:', err.message);
    }
}, 10 * 60 * 1000); // Internal background ping executes every 10 minutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
