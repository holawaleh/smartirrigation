const { sensorData, sensorHistory } = require('../data/storage');

// Get current sensor data for frontend
const getSensorData = (req, res) => {
  const { pumpStatus } = require('../data/storage');
  
  res.json({
    success: true,
    sensorData: {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      pressure: sensorData.pressure,
      soilMoisture: sensorData.soilMoisture,
      timestamp: sensorData.timestamp
    },
    pumpStatus: {
      isOn: pumpStatus.isOn,
      autoMode: pumpStatus.autoMode,
      lastToggled: pumpStatus.lastToggled
    }
  });
};

// Get sensor history
const getSensorHistory = (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recentHistory = sensorHistory.slice(-limit);
  
  res.json({
    success: true,
    history: recentHistory,
    count: recentHistory.length
  });
};

module.exports = {
  getSensorData,
  getSensorHistory
};