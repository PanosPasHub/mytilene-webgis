const express = require('express');
const router = express.Router();
const noiseController = require('../controllers/noiseController');

// GET /api/noise -> Καλεί τη getNoiseReports
router.get('/', noiseController.getNoiseReports);

// POST /api/noise -> Καλεί τη submitNoiseReport
router.post('/', noiseController.submitNoiseReport);

// Health Check (Προαιρετικά μπορεί να μείνει και στο server.js)
router.get('/health', (req, res) => {
    res.json({ status: 'UP', message: 'Noise API is running' });
});

module.exports = router;