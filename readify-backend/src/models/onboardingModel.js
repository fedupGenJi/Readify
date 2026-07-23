const pool = require('../config/db');

async function hasCompleted(userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM user_onboarding WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return rows.length > 0;
}

async function savePreferences({
  userId,
  booksRead,
  genres,
  readerStatus,
  recentBookDurationDays,
  recentBookPace,
  favoriteAuthors,
}) {
  const { rows } = await pool.query(
    `INSERT INTO user_onboarding (
      user_id, books_read, genres, reader_status, recent_book_duration_days,
      recent_book_pace, favorite_authors
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) DO UPDATE SET
      books_read = EXCLUDED.books_read,
      genres = EXCLUDED.genres,
      reader_status = EXCLUDED.reader_status,
      recent_book_duration_days = EXCLUDED.recent_book_duration_days,
      recent_book_pace = EXCLUDED.recent_book_pace,
      favorite_authors = EXCLUDED.favorite_authors,
      completed_at = NOW()
    RETURNING *`,
    [
      userId,
      booksRead,
      genres,
      readerStatus,
      recentBookDurationDays,
      recentBookPace,
      favoriteAuthors,
    ]
  );
  return rows[0];
}

module.exports = { hasCompleted, savePreferences };