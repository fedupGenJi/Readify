require('dotenv').config();
const os = require('os');
const app = require('./app');
const initDb = require('./db/init');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

(async () => {
  try {
    await initDb(); // ensure tables exists + resets temp_users
    app.listen(PORT, HOST, () => {
      const interfaces = os.networkInterfaces();

      console.log(`🚀 Server running:`);
      console.log(`Local:   http://localhost:${PORT}`);

      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`Network: http://${iface.address}:${PORT}`);
          }
        }
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();