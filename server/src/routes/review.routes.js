const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

// Public read reviews for a shop
router.get('/shop/:shopId', reviewController.getShopReviews);

// Protected submit review (verified customers only)
router.post('/', authenticate, reviewController.createReview);

module.exports = router;
