const { verifyToken } = require('../utils/jwtUtil');

/**
 * Unlike requireAuth, this never rejects the request. If a valid token is
 * present, req.user gets set (so the controller can check "is this my own
 * profile?"). If there's no token, or it's invalid/expired, req.user is just
 * left undefined and the request proceeds as an anonymous visitor. Use this
 * on routes that should work for logged-out users but behave differently
 * for a logged-in one (e.g. a public profile page).
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch (err) {
      // invalid/expired token - treat as anonymous rather than rejecting
    }
  }
  next();
}

module.exports = optionalAuth;