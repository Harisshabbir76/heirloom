const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  dashboardAccess,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard-access', dashboardAccess);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

