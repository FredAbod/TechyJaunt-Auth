const express = require('express');
const router = express.Router();
const { flutterwaveWebhook } = require('../controller/flutterwave.controller');

// Flutterwave webhook endpoint
router.post('/flutterwave', flutterwaveWebhook);

module.exports = router;
