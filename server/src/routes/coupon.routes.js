const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public/customer validation at checkout
router.post('/validate', couponController.validateCoupon);

// Admin coupon management
router.get('/', authenticate, authorize('ADMIN'), couponController.getAllCoupons);
router.post('/', authenticate, authorize('ADMIN'), couponController.createCoupon);
router.patch('/:id/toggle', authenticate, authorize('ADMIN'), couponController.toggleCoupon);

module.exports = router;
