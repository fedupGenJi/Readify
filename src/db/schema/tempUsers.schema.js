/**
 * Schema module for `temp_users` - the holding table for signups that
 * haven't finished OTP verification (local) or haven't picked a username
 * yet (Google). temporary: true means init.js drops and recreates this
 * table on every server start, so nothing half-finished survives a restart.
 */
module.exports = {
  name: 'temp_users',
  temporary: true,
  sql: [
    `CREATE TABLE temp_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      username VARCHAR(50),
      gmail VARCHAR(150) NOT NULL,
      password TEXT,
      google_id VARCHAR(100),
      otp VARCHAR(6),
      otp_expires_at TIMESTAMP,
      signup_type VARCHAR(10) NOT NULL, -- 'local' or 'google'
      pending_token VARCHAR(100) UNIQUE, -- used by the Google "pick a username" step
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    // Reserves usernames the moment a local signup starts (before OTP is even
    // verified), so a second person can't grab the same name while the first
    // person is mid-signup. Partial index because Google-flow rows in this
    // table often have username = NULL until the completion step.
    `CREATE UNIQUE INDEX idx_temp_users_username_lower
       ON temp_users (LOWER(username))
       WHERE signup_type = 'local' AND username IS NOT NULL;`,
  ],
};