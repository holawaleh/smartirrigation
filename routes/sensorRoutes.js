const express = require('express');
const router = express.Router();
const { getSensorData, getSensorHistory } = require('../controllers/sensorController');

// Get current sensor data for frontend
router.get('/sensors/data', getSensorData);

// Get sensor history (optional - for future dashboard features)
router.get('/sensors/history', getSensorHistory);

module.exports = router;