const prisma = require('../config/prisma');

/**
 * Pluggable Payment Abstraction Layer.
 * Supports MOCK online payments and Cash on Delivery out of the box,
 * and architected to cleanly swap in real Stripe/Razorpay SDKs.
 */
class PaymentService {
  /**
   * Process payment for an order
   */
  async processPayment({ orderId, amount, paymentMethod = 'ONLINE_MOCK', metadata = {} }) {
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      return {
        paymentMethod: 'CASH_ON_DELIVERY',
        transactionId: `COD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'PENDING',
        amount,
        metadata: JSON.stringify({ note: 'Cash to be collected upon doorstep delivery', ...metadata }),
      };
    }

    if (paymentMethod === 'ONLINE_MOCK') {
      // Simulate high-speed gateway verification
      const transactionId = `TXN-MOCK-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        paymentMethod: 'ONLINE_MOCK',
        transactionId,
        status: 'PAID',
        amount,
        metadata: JSON.stringify({
          provider: 'Localit Simulated Gateway',
          gatewayResponse: 'SUCCESS',
          authCode: 'AUTH' + Math.floor(Math.random() * 100000),
          processedAt: new Date().toISOString(),
          ...metadata,
        }),
      };
    }

    if (paymentMethod === 'STRIPE' || paymentMethod === 'RAZORPAY') {
      // Pluggable hook for live gateway SDKs
      return {
        paymentMethod,
        transactionId: `${paymentMethod}-${Date.now()}`,
        status: 'PENDING',
        amount,
        metadata: JSON.stringify(metadata),
      };
    }

    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }

  /**
   * Verify an asynchronous gateway webhook or callback
   */
  async verifyPayment(orderId, transactionId, status) {
    return prisma.payment.update({
      where: { orderId },
      data: {
        transactionId,
        status,
      },
    });
  }
}

module.exports = new PaymentService();
