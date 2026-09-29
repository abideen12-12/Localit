const couponService = require('../services/coupon.service');

class CouponController {
  async validateCoupon(req, res, next) {
    try {
      const { code, subtotal } = req.body;
      const result = await couponService.validateCoupon(code, parseFloat(subtotal) || 0);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllCoupons(req, res, next) {
    try {
      const coupons = await couponService.getAllCoupons();
      return res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req, res, next) {
    try {
      const { code, discountAmount } = req.body;
      if (!code || !discountAmount) {
        return res.status(400).json({ success: false, message: 'Coupon code and discount amount are required.' });
      }

      const coupon = await couponService.createCoupon(req.body);
      return res.status(201).json({ success: true, message: 'Coupon created.', data: coupon });
    } catch (error) {
      next(error);
    }
  }

  async toggleCoupon(req, res, next) {
    try {
      const updated = await couponService.toggleCoupon(req.params.id);
      return res.status(200).json({ success: true, message: 'Coupon status updated.', data: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponController();
