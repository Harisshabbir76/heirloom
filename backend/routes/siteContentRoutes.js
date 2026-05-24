const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
  getSiteContent,
  updateFaqs,
  updateLegalPolicies,
  updateStoryMemoryShopImages,
  updateOurStoryImages,
} = require('../controllers/siteContentController');
const { upload } = require('../config/cloudinary');

const requireAdmin = (req, res, next) => {
  const token = req.cookies?.auth_token || (
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null
  );

  if (!token || !process.env.JWT_SECRET) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const adminEmail = String(process.env.DASHBOARD_ACCESS_ADMIN_EMAIL || '').trim().toLowerCase();
    const userEmail = String(payload.email || '').trim().toLowerCase();

    if (!adminEmail || userEmail !== adminEmail) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return next();
  } catch {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
};

router.get('/', getSiteContent);
router.put('/faqs', requireAdmin, updateFaqs);
router.put('/legal', requireAdmin, updateLegalPolicies);
router.put('/story-memory-shop', requireAdmin, upload.any(), updateStoryMemoryShopImages);
router.put('/our-story', requireAdmin, upload.any(), updateOurStoryImages);

module.exports = router;
