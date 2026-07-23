const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/authMiddleware');
const onboardingController = require('../controllers/onboardingController');

router.post('/reading-preferences', requireAuth, onboardingController.saveReadingPreferences);

module.exports = router;