const express = require('express');
const router = express.Router();
const { handleZiinaWebhook } = require('../controllers/webhookController');

router.post('/ziina', handleZiinaWebhook);

module.exports = router;
