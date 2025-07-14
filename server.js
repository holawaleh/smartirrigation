const express = require('express');
const cors = require('cors');
const http = require('http');
const sensorRoutes = require('./routes/sensorRoutes');
const pumpRoutes = require('./routes/pumpRoutes');
const arduinoRoutes = require('./routes/arduinoRoutes');

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration - Allow your deployed frontend
const corsOptions = {
  origin: [
    'https://smartirrigation-rosy.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', sensorRoutes);
app.use('/api', pumpRoutes);
app.use('/api', arduinoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString(),
    server: 'Smart Irrigation System'
  });
});

// Arduino proxy endpoint to handle CORS issues
app.get('/api/arduino-proxy/:ip', async (req, res) => {
  const { ip } = req.params;
  
  try {
    const response = await fetch(`http://${ip}/api/data`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Arduino proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Arduino',
      message: error.message
    });
  }
});

// Arduino pump control proxy
app.post('/api/arduino-pump/:ip', async (req, res) => {
  const { ip } = req.params;
  
  try {
    const response = await fetch(`http://${ip}/pump`);
    const result = await response.text();
    res.json({
      success: true,
      message: result
    });
  } catch (error) {
    console.error('Arduino pump proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate Arduino pump',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Irrigation System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      sensors: '/api/sensors/data',
      pump: '/api/pump/toggle',
      arduino: {
        sensors: '/api/arduino/sensors (POST)',
        pump: '/api/arduino/pump (GET)',
        proxy: '/api/arduino-proxy/:ip (GET)',
        pumpProxy: '/api/arduino-pump/:ip (POST)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Smart Irrigation API running on port ${port}`);
  console.log(`🌐 Server URL: https://smartirrigation-edx5.onrender.com`);
  console.log(`🎯 Frontend URL: https://smartirrigation-rosy.vercel.app`);
});