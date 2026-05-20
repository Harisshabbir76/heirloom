const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

function signAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function getAdminEmail() {
  return String(process.env.DASHBOARD_ACCESS_ADMIN_EMAIL || '').trim().toLowerCase();
}

function getTokenFromRequest(req) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  return req.cookies?.auth_token || bearer;
}

function getUserFromRequest(req) {
  const token = getTokenFromRequest(req);
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function isAdminEmail(email) {
  const adminEmail = getAdminEmail();
  return Boolean(adminEmail && email && String(email).trim().toLowerCase() === adminEmail);
}

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

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

// @desc  Signup
// @route POST /api/auth/signup
// @access Public
exports.signup = async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    if (!name || !email || age === undefined || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, age, and password',
      });
    }

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid age',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      age: ageNum,
      passwordHash,
    });

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc  Login
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc  Check dashboard access for the logged-in user
// @route GET /api/auth/dashboard-access
// @access Protected
exports.dashboardAccess = async (req, res) => {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || !isAdminEmail(payload.email)) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.status(200).json({
      success: true,
      data: { email: payload.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Send password reset OTP
// @route POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Keep response generic so account existence is not leaked.
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent' });
    }

    const otp = generateOtp();
    user.resetPasswordOtpHash = await bcrypt.hash(otp, 10);
    user.resetPasswordOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"Heirloom By SK" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your password reset OTP',
      text: `Your Heirloom By SK password reset OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your Heirloom By SK password reset OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify OTP and change password
// @route POST /api/auth/reset-password
// @access Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.resetPasswordOtpExpiresAt.getTime() < Date.now()) {
      user.resetPasswordOtpHash = null;
      user.resetPasswordOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const isValidOtp = await bcrypt.compare(String(otp), user.resetPasswordOtpHash);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpiresAt = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Logout
// @route POST /api/auth/logout
// @access Protected (optional)
exports.logout = async (req, res) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

