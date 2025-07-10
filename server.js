const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
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

// --- FRONTEND-COMPATIBLE ENDPOINTS ---

// 🔌 Toggle Pump (Manual Control)
app.post('/api/pump/toggle', (req, res) => {
  const { action, mode } = req.body;

  if (!['toggle', 'on', 'off'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid action' });
  }

  let newStatus;
  if (action === 'toggle') {
    newStatus = !pumpStatus.isOn;
  } else {
    newStatus = action === 'on';
  }

  pumpStatus.isOn = newStatus;
  pumpStatus.lastToggled = new Date().toISOString();
  pumpStatus.autoMode = mode === 'auto';

  res.json({
    success: true,
    pumpStatus: {
      isOn: pumpStatus.isOn,
      autoMode: pumpStatus.autoMode
    }
  });
});

// 📊 Get Sensor Data + Pump Status
app.get('/api/sensors/data', (req, res) => {
  res.json({
    success: true,
    sensorData: {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      pressure: sensorData.pressure,
      soilMoisture: sensorData.soilMoisture
    },
    pumpStatus: {
      isOn: pumpStatus.isOn,
      autoMode: pumpStatus.autoMode
    }
  });
});

// 📤 Receive Sensor Data from MCU (ESP8266 / Arduino)
app.post('/api/sensors/data', (req, res) => {
  const { temperature, humidity, pressure, soilMoisture } = req.body;

  if (temperature === undefined || humidity === undefined || soilMoisture === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required data' });
  }

  // Update latest sensor data
  sensorData = {
    temperature: parseFloat(temperature),
    humidity: parseInt(humidity),
    pressure: pressure ? parseInt(pressure) : sensorData.pressure,
    soilMoisture: parseInt(soilMoisture),
    timestamp: new Date().toISOString()
  };

  // Store history (for trends)
  sensorHistory.push({ ...sensorData });
  if (sensorHistory.length > 100) sensorHistory.shift();

  // Auto-irrigation logic
  if (pumpStatus.autoMode) {
    if (sensorData.soilMoisture < 35 && !pumpStatus.isOn) {
      pumpStatus.isOn = true;
      pumpStatus.lastToggled = new Date().toISOString();
    } else if (sensorData.soilMoisture > 70 && pumpStatus.isOn) {
      pumpStatus.isOn = false;
      pumpStatus.lastToggled = new Date().toISOString();
    }
  }

  res.json({
    success: true,
    message: 'Sensor data received',
    pumpCommand: pumpStatus.isOn ? 'ON' : 'OFF',
    autoMode: pumpStatus.autoMode
  });
});

// ⚙️ Get Current Pump Command for MCU
app.get('/api/mcu/pump-command', (req, res) => {
  res.json({
    success: true,
    pumpCommand: pumpStatus.isOn ? 'ON' : 'OFF',
    autoMode: pumpStatus.autoMode,
    timestamp: new Date().toISOString()
  });
});

// 🧪 Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Smart Irrigation API running on http://localhost:${port}`);
});