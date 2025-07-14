const express = require('express');
const router = express.Router();
const { receiveSensorData, getPumpCommand, proxyArduinoData, proxyArduinoPump } = require('../controllers/arduinoController');

// Arduino sends sensor data to server (optional)
router.post('/arduino/sensors', receiveSensorData);

// Arduino requests pump command from server (optional)
router.get('/arduino/pump', getPumpCommand);

// Proxy endpoints to handle CORS issues when frontend connects directly to Arduino
router.get('/arduino-proxy/:ip', proxyArduinoData);
router.post('/arduino-pump/:ip', proxyArduinoPump);

module.exports = router;