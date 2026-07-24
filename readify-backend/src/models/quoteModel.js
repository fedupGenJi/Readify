const pool = require('../config/db');

/**
 * Recent quotes for a profile page, newest first, joined with the book's
 * title/author.
 *
 * `visibilities` is the array of visibility tiers the viewer is allowed to
 * see - see src/utils/visibility.js.
 */
async function findRecentByUser(userId, { limit = 3, visibilities = ['PUBLIC'] } = {}) {
  const { rows } = await pool.query(
    `SELECT
        q.quote_id,
        q.quote,
        q.visibility,
        q.created_at,
        q.book_id,
        b.title AS book_title,
        b.author AS book_author
     FROM quotes q
     JOIN books b ON b.book_id = q.book_id
     WHERE q.user_id = $1
       AND q.visibility = ANY($2::text[])
     ORDER BY q.created_at DESC
     LIMIT $3`,
    [userId, visibilities, limit]
  );
  return rows;
}

module.exports = { findRecentByUser };