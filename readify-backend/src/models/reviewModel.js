const pool = require('../config/db');
 
// Reviews have no visibility tiers - a review is essentially a post with a
// rating attached, and is always public. 
async function countByUser(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM reviews WHERE user_id = $1',
    [userId]
  );
  return rows[0].count;
}
 
async function findByUserPaginated(userId, { limit = 3, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT
        r.review_id,
        r.rating,
        r.review,
        r.created_at,
        r.book_id,
        b.title AS book_title,
        b.author AS book_author
     FROM reviews r
     JOIN books b ON b.book_id = r.book_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}
 
module.exports = { countByUser, findByUserPaginated };