const pool = require('../config/db');

async function countFollowers(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM followers WHERE following_id = $1',
    [userId]
  );
  return rows[0].count;
}

async function countFollowing(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM followers WHERE follower_id = $1',
    [userId]
  );
  return rows[0].count;
}

// "Friend" = mutual follow (both users follow each other). If you actually
// want one-directional ("anyone who follows me can see PRIVATE"), swap the
// AND for OR below and rename accordingly.
async function areFriends(userIdA, userIdB) {
  const { rows } = await pool.query(
    `SELECT
       EXISTS (SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2) AS a_follows_b,
       EXISTS (SELECT 1 FROM followers WHERE follower_id = $2 AND following_id = $1) AS b_follows_a`,
    [userIdA, userIdB]
  );
  return rows[0].a_follows_b && rows[0].b_follows_a;
}

// Single entry point used by every profile-page endpoint to decide what a
// viewer is allowed to see. viewerId is undefined/null for logged-out visitors.
async function getRelationship(viewerId, targetUserId) {
  if (!viewerId) return 'stranger';
  if (viewerId === targetUserId) return 'self';
  const friends = await areFriends(viewerId, targetUserId);
  return friends ? 'friend' : 'stranger';
}

module.exports = { countFollowers, countFollowing, areFriends, getRelationship };