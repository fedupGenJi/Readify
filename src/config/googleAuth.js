const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies the ID token sent by the frontend (from Google Sign-In)
 * and returns the decoded profile: { sub, email, name, picture, ... }
 * Throws if the token is invalid/expired/wrong audience.
 */
async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

module.exports = { verifyGoogleToken };