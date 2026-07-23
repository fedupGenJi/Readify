const userModel = require('../models/userModel');
const followerModel = require('../models/followerModel');
const reviewModel = require('../models/reviewModel');
const quoteModel = require('../models/quoteModel');
const postModel = require('../models/postModel');
const { toPublicUser } = require('../utils/userFormat');
const { getVisibleTiers } = require('../utils/visibility');

// ---------------------------------------------------------------------------
// GET /api/users/:username
// Public route (optionalAuth) - works for logged-out visitors too.
// Returns core profile fields + follower/following/review counts, and tells
// the frontend the viewer's relationship to this profile: 'self' | 'friend'
// | 'stranger'. "Friend" = mutual follow - see followerModel.areFriends.
// ---------------------------------------------------------------------------
async function getProfile(req, res, next) {
  try {
    const { username } = req.params;
    const targetUser = await userModel.findByUsername(username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const relationship = await followerModel.getRelationship(req.user?.userId, targetUser.user_id);
    const isOwnProfile = relationship === 'self';

    const [followersCount, followingCount, reviewsCount] = await Promise.all([
      followerModel.countFollowers(targetUser.user_id),
      followerModel.countFollowing(targetUser.user_id),
      reviewModel.countByUser(targetUser.user_id),
    ]);

    const profile = toPublicUser(targetUser);
    if (!isOwnProfile) {
      // gmail and the first-login flag are nobody else's business
      delete profile.gmail;
      delete profile.isFirstLogin;
    }

    return res.json({
      user: profile,
      isOwnProfile,
      relationship, // 'self' | 'friend' | 'stranger'
      followersCount,
      followingCount,
      reviewsCount,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/users/:username/quotes?limit=3
// ---------------------------------------------------------------------------
async function getRecentQuotes(req, res, next) {
  try {
    const { username } = req.params;
    const targetUser = await userModel.findByUsername(username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const relationship = await followerModel.getRelationship(req.user?.userId, targetUser.user_id);
    const visibilities = getVisibleTiers(relationship);
    const limit = Math.min(Number(req.query.limit) || 3, 20);

    const quotes = await quoteModel.findRecentByUser(targetUser.user_id, { limit, visibilities });

    return res.json({
      quotes: quotes.map((q) => ({
        quoteId: q.quote_id,
        quote: q.quote,
        visibility: q.visibility,
        createdAt: q.created_at,
        book: { bookId: q.book_id, title: q.book_title, author: q.book_author },
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/users/:username/posts?limit=3&offset=0
//
// Visibility by relationship:
//   self     -> PUBLIC + PRIVATE + JUST_ME
//   friend   -> PUBLIC + PRIVATE
//   stranger -> PUBLIC only
//
// Frontend usage: call once with limit=3&offset=0 for a fast first paint,
// then again with a larger limit and offset=3 to load the rest.
// ---------------------------------------------------------------------------
async function getPosts(req, res, next) {
  try {
    const { username } = req.params;
    const targetUser = await userModel.findByUsername(username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const relationship = await followerModel.getRelationship(req.user?.userId, targetUser.user_id);
    const visibilities = getVisibleTiers(relationship);
    const limit = Math.min(Number(req.query.limit) || 3, 30);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const posts = await postModel.findByUserPaginated(targetUser.user_id, {
      limit,
      offset,
      visibilities,
    });

    return res.json({
      posts: posts.map((p) => ({
        postId: p.post_id,
        caption: p.caption,
        visibility: p.visibility,
        createdAt: p.created_at,
        likeCount: p.like_count,
        book: p.book_id ? { bookId: p.book_id, title: p.book_title, author: p.book_author } : null,
      })),
      limit,
      offset,
      hasMore: posts.length === limit,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/users/:username/reviews?limit=3&offset=0
// Reviews have no visibility tiers - always public, so no relationship
// check needed here (unlike getPosts/getRecentQuotes).
// ---------------------------------------------------------------------------
async function getReviews(req, res, next) {
  try {
    const { username } = req.params;
    const targetUser = await userModel.findByUsername(username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limit = Math.min(Number(req.query.limit) || 3, 30);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const reviews = await reviewModel.findByUserPaginated(targetUser.user_id, { limit, offset });

    return res.json({
      reviews: reviews.map((r) => ({
        reviewId: r.review_id,
        rating: Number(r.rating),
        review: r.review,
        createdAt: r.created_at,
        book: { bookId: r.book_id, title: r.book_title, author: r.book_author },
      })),
      limit,
      offset,
      hasMore: reviews.length === limit,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, getRecentQuotes, getPosts, getReviews };