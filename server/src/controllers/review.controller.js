const reviewService = require('../services/review.service');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Thank you! Your verified review has been submitted.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShopReviews(req, res, next) {
    try {
      const reviews = await reviewService.getShopReviews(req.params.shopId);
      return res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
