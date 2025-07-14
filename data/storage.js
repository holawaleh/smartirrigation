// In-memory data storage
let sensorData = {
  temperature: 27.0,
  humidity: 64,
  pressure: 1012,
  soilMoisture: 46,
  timestamp: new Date().toISOString()
};

let pumpStatus = {
  isOn: false,
  lastToggled: new Date().toISOString(),
  autoMode: true
};

let sensorHistory = [];

module.exports = {
  sensorData,
  pumpStatus,
  sensorHistory
};