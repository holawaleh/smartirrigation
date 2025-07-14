const { pumpStatus } = require('../data/storage');

// Toggle pump status (frontend control)
const togglePump = (req, res) => {
  const { action, mode } = req.body;

  if (!['toggle', 'on', 'off'].includes(action)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid action. Use: toggle, on, or off' 
    });
  }

  let newStatus;
  if (action === 'toggle') {
    newStatus = !pumpStatus.isOn;
  } else {
    newStatus = action === 'on';
  }

  // Update pump status
  pumpStatus.isOn = newStatus;
  pumpStatus.lastToggled = new Date().toISOString();
  pumpStatus.autoMode = mode === 'auto';

  console.log(`Pump ${newStatus ? 'ON' : 'OFF'} (${mode} mode)`);

  res.json({
    success: true,
    message: `Pump turned ${newStatus ? 'ON' : 'OFF'}`,
    pumpStatus: {
      isOn: pumpStatus.isOn,
      autoMode: pumpStatus.autoMode,
      lastToggled: pumpStatus.lastToggled
    }
  });
};

module.exports = {
  togglePump
};