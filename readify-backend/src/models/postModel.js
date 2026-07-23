const pool = require('../config/db');

/**
 * Paginated posts for a profile page, newest first, with each post's like
 * count attached (post likes only - the join is strictly on
 * posts.post_id = likes.post_id, so quote likes never factor in). Comments
 * are intentionally not included.
 *
 * `visibilities` is the array of visibility tiers the viewer is allowed to
 * see, e.g. ['PUBLIC'] for a stranger, ['PUBLIC','PRIVATE'] for a friend,
 * or all three for the profile owner - see src/utils/visibility.js.
 */
async function findByUserPaginated(userId, { limit = 3, offset = 0, visibilities = ['PUBLIC'] } = {}) {
  const { rows } = await pool.query(
    `SELECT
        p.post_id,
        p.caption,
        p.visibility,
        p.created_at,
        p.book_id,
        b.title AS book_title,
        b.author AS book_author,
        COUNT(l.like_id)::int AS like_count
     FROM posts p
     LEFT JOIN books b ON b.book_id = p.book_id
     LEFT JOIN likes l ON l.post_id = p.post_id
     WHERE p.user_id = $1
       AND p.visibility = ANY($2::text[])
     GROUP BY p.post_id, b.title, b.author
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [userId, visibilities, limit, offset]
  );
  return rows;
}

module.exports = { findByUserPaginated };