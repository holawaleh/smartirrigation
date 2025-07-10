const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for sensor data and pump status
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

// Store recent sensor readings for trend analysis
let sensorHistory = [];

// ENDPOINT 1: Switch pump control
app.post('/api/pump/toggle', (req, res) => {
  try {
    const { action, mode } = req.body;
    
    let newStatus;
    
    if (action === 'toggle') {
      newStatus = !pumpStatus.isOn;
    } else if (action === 'on') {
      newStatus = true;
    } else if (action === 'off') {
      newStatus = false;
    } else {
      return res.status(400).json({ 
        error: 'Invalid action. Use "on", "off", or "toggle"' 
      });
    }
    
    pumpStatus.isOn = newStatus;
    pumpStatus.lastToggled = new Date().toISOString();
    
    if (mode) {
      pumpStatus.autoMode = mode === 'auto';
    }
    
    console.log(`Pump ${newStatus ? 'ON' : 'OFF'} - Mode: ${pumpStatus.autoMode ? 'Auto' : 'Manual'}`);
    
    res.json({
      success: true,
      pumpStatus: pumpStatus,
      message: `Pump turned ${newStatus ? 'ON' : 'OFF'}`
    });
    
  } catch (error) {
    console.error('Error toggling pump:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ENDPOINT 2: Receive sensor data from MCU
app.post('/api/sensors/data', (req, res) => {
  try {
    const { temperature, humidity, pressure, soilMoisture } = req.body;
    
    if (temperature === undefined || humidity === undefined || soilMoisture === undefined) {
      return res.status(400).json({ 
        error: 'Missing required sensor data' 
      });
    }
    
    // Update sensor data
    sensorData = {
      temperature: parseFloat(temperature),
      humidity: parseInt(humidity),
      pressure: pressure ? parseInt(pressure) : sensorData.pressure,
      soilMoisture: parseInt(soilMoisture),
      timestamp: new Date().toISOString()
    };
    
    // Add to history
    sensorHistory.push({ ...sensorData });
    if (sensorHistory.length > 100) {
      sensorHistory.shift();
    }
    
    // Auto-irrigation logic
    if (pumpStatus.autoMode) {
      if (sensorData.soilMoisture < 35 && !pumpStatus.isOn) {
        pumpStatus.isOn = true;
        pumpStatus.lastToggled = new Date().toISOString();
        console.log('Auto-irrigation: Pump turned ON');
      } else if (sensorData.soilMoisture > 70 && pumpStatus.isOn) {
        pumpStatus.isOn = false;
        pumpStatus.lastToggled = new Date().toISOString();
        console.log('Auto-irrigation: Pump turned OFF');
      }
    }
    
    res.json({
      success: true,
      message: 'Sensor data received',
      pumpCommand: pumpStatus.isOn ? 'ON' : 'OFF',
      autoMode: pumpStatus.autoMode
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get current sensor data
app.get('/api/sensors/data', (req, res) => {
  res.json({
    success: true,
    sensorData: sensorData,
    pumpStatus: pumpStatus
  });
});

// MCU endpoint to get pump commands
app.get('/api/mcu/pump-command', (req, res) => {
  res.json({
    success: true,
    pumpCommand: pumpStatus.isOn ? 'ON' : 'OFF',
    autoMode: pumpStatus.autoMode,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Irrigation API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`Smart Irrigation API Server running on port ${port}`);
});