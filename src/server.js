require('dotenv').config();
const app = require('./app');
const initDb = require('./db/init');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb(); // ensures users table exists + resets temp_users
    app.listen(PORT, () => {
      console.log(`🚀 Readify backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();