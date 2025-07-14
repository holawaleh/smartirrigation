const { sensorData, sensorHistory, pumpStatus } = require('../data/storage');

// Receive sensor data from Arduino (if Arduino wants to send to server)
const receiveSensorData = (req, res) => {
  const { temperature, humidity, pressure, soilMoisture, threshold, pumpActive } = req.body;

  // Validation
  if (temperature === undefined || humidity === undefined || soilMoisture === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required sensor data. Need: temperature, humidity, soilMoisture' 
    });
  }

  // Update sensor data from Arduino
  sensorData.temperature = parseFloat(temperature);
  sensorData.humidity = parseInt(humidity);
  sensorData.pressure = pressure ? parseInt(pressure) : sensorData.pressure;
  sensorData.soilMoisture = parseInt(soilMoisture);
  sensorData.timestamp = new Date().toISOString();

  // Store in history
  sensorHistory.push({ ...sensorData });
  if (sensorHistory.length > 100) {
    sensorHistory.shift(); // Keep only last 100 readings
  }

  // Update pump status if Arduino provides it
  if (pumpActive !== undefined) {
    pumpStatus.isOn = pumpActive;
    pumpStatus.lastToggled = new Date().toISOString();
  }

  console.log(`Arduino Data - Temp: ${temperature}°C, Humidity: ${humidity}%, Moisture: ${soilMoisture}, Pump: ${pumpActive ? 'ON' : 'OFF'}`);

  // Response for Arduino
  res.json({
    success: true,
    message: 'Arduino sensor data received successfully',
    timestamp: new Date().toISOString(),
    serverPumpCommand: pumpStatus.isOn ? 'ON' : 'OFF'
  });
};

// Get pump command for Arduino (if Arduino wants server control)
const getPumpCommand = (req, res) => {
  res.json({
    success: true,
    pumpCommand: pumpStatus.isOn ? 'ON' : 'OFF',
    autoMode: pumpStatus.autoMode,
    timestamp: new Date().toISOString(),
    soilMoisture: sensorData.soilMoisture,
    message: 'Server pump command for Arduino'
  });
};

// Proxy Arduino data (to handle CORS issues)
const proxyArduinoData = async (req, res) => {
  const { ip } = req.params;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://${ip}/api/data`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`Arduino responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      arduinoData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Arduino proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Arduino',
      message: error.message,
      ip: ip
    });
  }
};

// Proxy Arduino pump control
const proxyArduinoPump = async (req, res) => {
  const { ip } = req.params;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://${ip}/pump`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`Arduino responded with status: ${response.status}`);
    }
    
    const result = await response.text();
    res.json({
      success: true,
      message: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Arduino pump proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate Arduino pump',
      message: error.message,
      ip: ip
    });
  }
};

module.exports = {
  receiveSensorData,
  getPumpCommand,
  proxyArduinoData,
  proxyArduinoPump
};