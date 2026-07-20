const pool = require('../config/db');

// ---- local (email/password) signup pending OTP verification ----

async function findLocalPendingByGmail(gmail) {
  const { rows } = await pool.query(
    `SELECT * FROM temp_users WHERE gmail = $1 AND signup_type = 'local'`,
    [gmail]
  );
  return rows[0] || null;
}

async function deleteByGmailAndType(gmail, signupType) {
  await pool.query(`DELETE FROM temp_users WHERE gmail = $1 AND signup_type = $2`, [
    gmail,
    signupType,
  ]);
}

async function createLocalSignup({ name, username, gmail, password, otp, otpExpiresAt }) {
  // Remove any previous unfinished attempt for this email first.
  await deleteByGmailAndType(gmail, 'local');
  const { rows } = await pool.query(
    `INSERT INTO temp_users (name, username, gmail, password, otp, otp_expires_at, signup_type)
     VALUES ($1, $2, $3, $4, $5, $6, 'local')
     RETURNING *`,
    [name, username, gmail, password, otp, otpExpiresAt]
  );
  return rows[0];
}

async function updateOtp(id, otp, otpExpiresAt) {
  const { rows } = await pool.query(
    `UPDATE temp_users SET otp = $1, otp_expires_at = $2 WHERE id = $3 RETURNING *`,
    [otp, otpExpiresAt, id]
  );
  return rows[0];
}

async function isUsernameReserved(username) {
  // Any in-progress local signup (pre-OTP-verification) that already claimed
  // this username, case-insensitively.
  const { rows } = await pool.query(
    `SELECT 1 FROM temp_users
     WHERE signup_type = 'local' AND LOWER(username) = LOWER($1)
     LIMIT 1`,
    [username]
  );
  return rows.length > 0;
}

// ---- Google signup pending username selection ----

async function createGoogleSignup({ name, gmail, googleId, pendingToken }) {
  // Remove any previous unfinished Google signup for this email first.
  await deleteByGmailAndType(gmail, 'google');
  const { rows } = await pool.query(
    `INSERT INTO temp_users (name, gmail, google_id, signup_type, pending_token)
     VALUES ($1, $2, $3, 'google', $4)
     RETURNING *`,
    [name, gmail, googleId, pendingToken]
  );
  return rows[0];
}

async function findByPendingToken(pendingToken) {
  const { rows } = await pool.query(
    `SELECT * FROM temp_users WHERE pending_token = $1 AND signup_type = 'google'`,
    [pendingToken]
  );
  return rows[0] || null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM temp_users WHERE id = $1', [id]);
}

async function createResetRequest({ gmail, password, otp, otpExpiresAt }) {
  await deleteByGmailAndType(gmail, 'reset'); // clear any earlier unfinished reset attempt
  const { rows } = await pool.query(
    `INSERT INTO temp_users (gmail, password, otp, otp_expires_at, signup_type)
     VALUES ($1, $2, $3, $4, 'reset')
     RETURNING *`,
    [gmail, password, otp, otpExpiresAt]
  );
  return rows[0];
}

module.exports = {
  findLocalPendingByGmail,
  createLocalSignup,
  updateOtp,
  isUsernameReserved,
  createGoogleSignup,
  findByPendingToken,
  deleteByGmailAndType,
  deleteById,
  createResetRequest,
};