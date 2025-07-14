const express = require('express');
const router = express.Router();
const { togglePump } = require('../controllers/pumpController');

// Toggle pump status from frontend
router.post('/pump/toggle', togglePump);

module.exports = router;