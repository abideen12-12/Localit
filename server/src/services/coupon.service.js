const prisma = require('../config/prisma');

class CouponService {
  /**
   * Validate a coupon code for checkout
   */
  async validateCoupon(code, subtotal) {
    if (!code) {
      const error = new Error('Coupon code is required.');
      error.statusCode = 400;
      throw error;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      const error = new Error('Invalid or expired coupon code.');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      const error = new Error('This coupon code has expired.');
      error.statusCode = 400;
      throw error;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      const error = new Error('This coupon code has reached its maximum redemption limit.');
      error.statusCode = 400;
      throw error;
    }

    if (subtotal < coupon.minOrderAmount) {
      const error = new Error(
        `Minimum order amount of ₹${coupon.minOrderAmount} required to use coupon "${coupon.code}".`
      );
      error.statusCode = 400;
      throw error;
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountAmount;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
      },
      discount: parseFloat(discount.toFixed(2)),
      message: `Coupon "${coupon.code}" applied! You save ₹${discount.toFixed(2)}.`,
    };
  }

  /**
   * Admin: List coupons
   */
  async getAllCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Create coupon
   */
  async createCoupon(data) {
    return prisma.coupon.create({
      data: {
        code: data.code.trim().toUpperCase(),
        discountType: data.discountType || 'PERCENTAGE',
        discountAmount: parseFloat(data.discountAmount),
        minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : 100,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Admin: Toggle coupon active
   */
  async toggleCoupon(id) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error('Coupon not found.');

    return prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }
}

module.exports = new CouponService();
