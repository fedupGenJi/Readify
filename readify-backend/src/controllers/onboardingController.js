const onboardingModel = require('../models/onboardingModel');

const STATUS_MAP = {
  starting: 'LOOKING_FORWARD',
  active: 'ACTIVE',
  returning: 'RETURNING_FROM_BREAK',
};

const PACE_MAP = {
  on_time: 'ON_TIME',
  faster: 'FASTER',
  slower: 'SLOWER',
};

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

function splitAnswers(value) {
  if (!value) return null;
  const answers = value.split(/[,\n]/).map((answer) => answer.trim()).filter(Boolean);
  return answers.length ? answers : null;
}

function durationInDays(value) {
  if (!value) return null;
  const match = value.trim().match(/^(\d+(?:\.\d+)?|[a-z]+)\s*(day|days|week|weeks|month|months)?$/i);
  if (!match) return null;

  const amount = NUMBER_WORDS[match[1].toLowerCase()] ?? Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  const unit = (match[2] || 'days').toLowerCase();
  const multiplier = unit.startsWith('month') ? 30 : unit.startsWith('week') ? 7 : 1;
  return Math.max(1, Math.round(amount * multiplier));
}

async function saveReadingPreferences(req, res, next) {
  try {
    const {
      booksRead,
      genres,
      readerStatus,
      recentBookDuration,
      recentBookPace,
      favoriteAuthors,
    } = req.body;

    const normalizedStatus = STATUS_MAP[readerStatus];
    const normalizedPace = recentBookPace ? PACE_MAP[recentBookPace] : null;
    if (!normalizedStatus || !Array.isArray(genres) || (readerStatus !== 'starting' && !normalizedPace)) {
      return res.status(400).json({ error: 'Please provide valid reading preferences.' });
    }

    const recentBookDurationDays = durationInDays(recentBookDuration);
    if (readerStatus !== 'starting' && !recentBookDurationDays) {
      return res.status(400).json({
        error: 'Duration must be a number of days, weeks, or months (for example, 2 weeks).',
      });
    }

    await onboardingModel.savePreferences({
      userId: req.user.userId,
      booksRead: splitAnswers(booksRead),
      genres: genres.length ? genres : null,
      readerStatus: normalizedStatus,
      recentBookDurationDays: readerStatus === 'starting' ? null : recentBookDurationDays,
      recentBookPace: readerStatus === 'starting' ? null : normalizedPace,
      favoriteAuthors: splitAnswers(favoriteAuthors),
    });

    return res.json({ message: 'Reading preferences saved.', onboardingComplete: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { saveReadingPreferences };