# Smart Irrigation System with ESP8266 Integration

A complete IoT-based irrigation system with ESP8266/Arduino integration and web dashboard.

## System Overview

- **Frontend**: HTML/CSS/JavaScript (deployed on Vercel)
- **Backend**: Node.js/Express (deployed on Render)
- **Hardware**: ESP8266 with DHT11, soil moisture sensor, and relay

## Deployment URLs

- **Frontend**: https://smartirrigation-rosy.vercel.app/
- **Backend**: https://smartirrigation-edx5.onrender.com

## Arduino/ESP8266 Setup

### Hardware Requirements
- ESP8266 (NodeMCU/Wemos D1 Mini)
- DHT11 temperature/humidity sensor
- Soil moisture sensor
- Relay module for pump control
- Water pump
- Jumper wires and breadboard

### Pin Connections
```
DHT11_PIN = 13 (D7)
MOISTURE_PIN = A0 (Analog)
RELAY_PIN = 4 (D2)
```

### Arduino Libraries Required
```cpp
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DFRobot_DHT11.h>
#include <EEPROM.h>
```

### Arduino Features
- **WiFi Setup**: Creates AP mode for initial configuration
- **Web Dashboard**: Built-in web interface at Arduino's IP
- **Auto-irrigation**: Activates pump when soil moisture > threshold
- **Manual Control**: Web-based pump activation
- **Settings**: Adjustable moisture threshold
- **EEPROM Storage**: Saves WiFi credentials and settings

## Web Dashboard Features

### Arduino Connection
- Enter Arduino's IP address to connect
- Real-time sensor data display
- Arduino pump status monitoring
- Manual pump control via Arduino

### Server Features
- Backup sensor data simulation
- Server-based pump control
- Auto/Manual mode switching
- Connection status monitoring

## API Endpoints

### Frontend-Server Communication
- `GET /api/sensors/data` - Get current sensor readings and pump status
- `POST /api/pump/toggle` - Toggle server pump on/off

### Arduino-Server Communication (Optional)
- `POST /api/arduino/sensors` - Arduino sends sensor data to server
- `GET /api/arduino/pump` - Arduino gets pump command from server

### Arduino Direct Communication
- `GET http://[ARDUINO_IP]/api/data` - Get Arduino sensor data
- `GET http://[ARDUINO_IP]/pump` - Activate Arduino pump manually
- `GET http://[ARDUINO_IP]/` - Arduino web dashboard
- `GET http://[ARDUINO_IP]/settings` - Arduino settings page

## Setup Instructions

### 1. Arduino Setup
1. Install required libraries in Arduino IDE
2. Upload the provided Arduino code to ESP8266
3. Power on the ESP8266
4. Connect to WiFi network "ESP_IrrigationSetup" (password: 12345678)
5. Open browser and go to 192.168.4.1
6. Select your WiFi network and enter password
7. Note the assigned IP address

### 2. Web Dashboard Setup
1. Open https://smartirrigation-rosy.vercel.app/
2. Enter your Arduino's IP address in the connection panel
3. Click "Connect" to establish connection
4. Monitor real-time sensor data and control pump

### 3. Hardware Connections
```
ESP8266 Pin Connections:
- DHT11 Data → D7 (GPIO13)
- Soil Moisture Analog → A0
- Relay Control → D2 (GPIO4)
- Power: 3.3V/5V and GND
```

## System Operation

### Auto-Irrigation Logic
- Arduino monitors soil moisture continuously
- When moisture > threshold (default 600): Pump activates for 5 seconds
- Threshold adjustable via Arduino settings page
- Higher values = drier soil triggers pump

### Manual Control
- **Arduino Dashboard**: Direct pump control via Arduino's web interface
- **Web Dashboard**: Manual pump activation through main dashboard
- **Dual Control**: Both systems can control their respective pumps

### Data Flow
1. Arduino reads sensors every 2 seconds
2. Web dashboard fetches Arduino data every 3 seconds
3. Server maintains backup sensor simulation
4. Real-time updates on both dashboards

## Troubleshooting

### Common Issues
1. **Arduino Not Connecting**: 
   - Check WiFi credentials
   - Verify Arduino is powered and running
   - Try connecting to ESP_IrrigationSetup AP

2. **Web Dashboard Connection Failed**:
   - Verify Arduino IP address
   - Check if Arduino and computer are on same network
   - Try accessing Arduino dashboard directly

3. **Pump Not Working**:
   - Check relay connections
   - Verify pump power supply
   - Test manual activation via Arduino dashboard

4. **Sensor Readings Incorrect**:
   - Check sensor connections
   - Calibrate moisture sensor threshold
   - Verify DHT11 wiring

### Debug Tips
- Monitor Arduino Serial output (115200 baud)
- Check Arduino dashboard at http://[ARDUINO_IP]/
- Use browser developer tools for web dashboard errors
- Verify network connectivity between devices

## Advanced Features

### EEPROM Storage
- WiFi credentials saved automatically
- Moisture threshold persists after restart
- Settings survive power cycles

### Web Interface
- Responsive design for mobile/desktop
- Real-time sensor monitoring
- Connection status indicators
- Manual and automatic pump control

### Expandability
- Add more sensors easily
- Multiple pump control
- Data logging capabilities
- Remote monitoring via server

## License
MIT License

## Support
For issues and questions, check the Arduino Serial monitor output and web dashboard console logs.