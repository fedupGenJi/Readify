const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');
const optionalAuth = require('../middleware/optionalAuth');

// All three work for logged-out visitors (public profile pages), but behave
// differently if the visitor happens to be logged in as the profile owner.
router.get('/:username', optionalAuth, profileController.getProfile);
router.get('/:username/quotes', optionalAuth, profileController.getRecentQuotes);
router.get('/:username/posts', optionalAuth, profileController.getPosts);
router.get('/:username/reviews', optionalAuth, profileController.getReviews);

module.exports = router;