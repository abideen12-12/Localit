const prisma = require('../config/prisma');

class ReviewService {
  /**
   * Submit review for a delivered order item.
   * CRITICAL RULE 11: Only customers who actually purchased the product and had order DELIVERED can review.
   * Prevents duplicate reviews for the same order/product.
   */
  async createReview(customerId, { orderId, productId, rating, comment }) {
    if (!orderId || !rating) {
      const error = new Error('Order ID and star rating (1-5) are required.');
      error.statusCode = 400;
      throw error;
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      const error = new Error('Rating must be an integer between 1 and 5 stars.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Verify order exists, belongs to this customer, and is DELIVERED
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shop: true,
      },
    });

    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    if (order.customerId !== customerId) {
      const error = new Error('You can only review orders placed by your account.');
      error.statusCode = 403;
      throw error;
    }

    if (order.orderStatus !== 'DELIVERED') {
      const error = new Error('You can only review products after your order has been successfully delivered.');
      error.statusCode = 400;
      throw error;
    }

    // 2. If productId provided, verify product was part of this order
    let targetProductId = productId;
    if (targetProductId) {
      const itemInOrder = order.items.find((i) => i.productId === targetProductId);
      if (!itemInOrder) {
        const error = new Error('This product was not part of the specified order.');
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Default to first item if single-review
      targetProductId = order.items[0]?.productId;
    }

    // 3. Prevent duplicate review for the same order and product
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId: targetProductId,
        },
      },
    });

    if (existingReview) {
      const error = new Error('You have already submitted a review for this purchase.');
      error.statusCode = 409;
      throw error;
    }

    return prisma.review.create({
      data: {
        customerId,
        shopId: order.shopId,
        productId: targetProductId,
        orderId,
        rating: parsedRating,
        comment: comment?.trim() || null,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Get reviews for a shop
   */
  async getShopReviews(shopId) {
    return prisma.review.findMany({
      where: { shopId },
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}

module.exports = new ReviewService();
