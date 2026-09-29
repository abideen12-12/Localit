const prisma = require('../config/prisma');
const paymentService = require('./payment.service');

class OrderService {
  /**
   * Generates a unique human-friendly order invoice number
   */
  generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `LOC-${dateStr}-${randomHex}`;
  }

  /**
   * ATOMIC TRANSACTION: Create Order from active Cart
   */
  async createOrder(customerId, { addressId, paymentMethod = 'ONLINE_MOCK', couponCode }) {
    // 1. Fetch customer's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: customerId },
      include: {
        shop: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || !cart.shopId || cart.items.length === 0) {
      const error = new Error('Your cart is empty. Add products before checking out.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: customerId },
    });

    if (!address) {
      const error = new Error('Please select a valid delivery address.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Execute order creation inside an atomic ACID transaction
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // Check stock and freeze prices for each cart item
      for (const item of cart.items) {
        // Query product with row lock / fresh state inside transaction
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.status === 'DISCONTINUED') {
          throw new Error(`Product "${item.product.name}" is no longer available.`);
        }

        if (product.status === 'OUT_OF_STOCK' || product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
          );
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        // Decrement stock safely
        const updatedStock = product.stockQuantity - item.quantity;
        const newStatus = updatedStock <= 0 ? 'OUT_OF_STOCK' : product.status;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: updatedStock,
            status: newStatus,
          },
        });
      }

      const deliveryFee = cart.shop.deliveryFee || 0;
      let discount = 0;
      let couponId = null;

      // Apply coupon if valid
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.trim().toUpperCase() },
        });

        if (
          coupon &&
          coupon.isActive &&
          new Date(coupon.expiryDate) > new Date() &&
          subtotal >= coupon.minOrderAmount &&
          coupon.usedCount < coupon.usageLimit
        ) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountAmount) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountAmount;
          }
          discount = Math.min(discount, subtotal);
          couponId = coupon.id;

          // Increment coupon usage
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const tax = parseFloat(((subtotal - discount) * 0.05).toFixed(2)); // 5% GST on essentials
      const totalAmount = parseFloat((subtotal + deliveryFee - discount + tax).toFixed(2));
      const orderNumber = this.generateOrderNumber();

      // Process initial payment record via abstraction
      const paymentResult = await paymentService.processPayment({
        orderId: 'temp',
        amount: totalAmount,
        paymentMethod,
      });

      const initialOrderStatus = paymentResult.status === 'PAID' ? 'CONFIRMED' : 'PENDING';

      // Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          shopId: cart.shopId,
          addressId,
          couponId,
          subtotal,
          deliveryFee,
          discount,
          tax,
          totalAmount,
          orderStatus: initialOrderStatus,
          paymentStatus: paymentResult.status,
        },
      });

      // Create Order Items with CRITICAL PRICE & NAME FREEZE
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productNameSnapshot: item.product.name,
            priceSnapshot: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          },
        });
      }

      // Create Payment linked to Order
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: paymentResult.paymentMethod,
          transactionId: paymentResult.transactionId,
          amount: totalAmount,
          status: paymentResult.status,
          metadata: paymentResult.metadata,
        },
      });

      // Clear customer's cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { shopId: null },
      });

      // Generate notifications
      await tx.notification.create({
        data: {
          userId: customerId,
          title: `Order Placed: ${order.orderNumber}`,
          message: `Your order from ${cart.shop.shopName} has been placed successfully for ₹${totalAmount}.`,
          type: 'ORDER',
          orderId: order.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: cart.shop.ownerId,
          title: `New Order Received: ${order.orderNumber}`,
          message: `You have received a new order with ${cart.items.length} items totaling ₹${totalAmount}.`,
          type: 'ORDER',
          orderId: order.id,
        },
      });

      return order;
    });
  }

  /**
   * Get customer's order history
   */
  async getCustomerOrders(customerId) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            address: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: { imageUrl: true, unit: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single order by ID with authorization check
   */
  async getOrderById(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: {
          select: {
            id: true,
            ownerId: true,
            shopName: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: { imageUrl: true, unit: true },
            },
          },
        },
        payment: true,
        reviews: true,
      },
    });

    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    // Role-based authorization
    if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
      const error = new Error('Unauthorized to view this order.');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === 'SHOP_OWNER' && order.shop.ownerId !== user.id) {
      const error = new Error('Unauthorized to view this shop order.');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  /**
   * Cancel Order and restore stock safely in transaction
   */
  async cancelOrder(orderId, userId, reason) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shop: true,
        payment: true,
      },
    });

    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    // Must be either customer or shop owner or admin
    if (order.customerId !== userId && order.shop.ownerId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        const error = new Error('Unauthorized to cancel this order.');
        error.statusCode = 403;
        throw error;
      }
    }

    // Business Rule 10: Delivered orders cannot normally be cancelled
    if (order.orderStatus === 'DELIVERED') {
      const error = new Error('Delivered orders cannot be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    if (order.orderStatus === 'CANCELLED') {
      const error = new Error('Order is already cancelled.');
      error.statusCode = 400;
      throw error;
    }

    // Execute cancellation & stock restoration inside transaction
    return prisma.$transaction(async (tx) => {
      // Restore inventory stock
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const restoredStock = product.stockQuantity + item.quantity;
          const status = product.status === 'OUT_OF_STOCK' && restoredStock > 0 ? 'AVAILABLE' : product.status;

          await tx.product.update({
            where: { id: product.id },
            data: {
              stockQuantity: restoredStock,
              status,
            },
          });
        }
      }

      // Update Order and Payment status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'CANCELLED',
          cancellationReason: reason || 'Cancelled by customer',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
        },
      });

      if (order.payment) {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: order.payment.status === 'PAID' ? 'REFUNDED' : 'FAILED',
          },
        });
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: order.customerId,
          title: `Order Cancelled: ${order.orderNumber}`,
          message: `Your order has been cancelled. Any pre-paid amount has been initiated for refund.`,
          type: 'ORDER',
          orderId: order.id,
        },
      });

      return updatedOrder;
    });
  }

  /**
   * Update Order Status progression (Shop Owner & Admin)
   */
  async updateOrderStatus(orderId, newStatus, actorId, actorRole) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: true },
    });

    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    // Role check: Only the owning merchant or admin can update status
    if (actorRole === 'SHOP_OWNER' && order.shop.ownerId !== actorId) {
      const error = new Error('Unauthorized. You can only manage orders for your own shop.');
      error.statusCode = 403;
      throw error;
    }

    // Update payment status to PAID upon delivery if Cash on Delivery
    const paymentStatusUpdate =
      newStatus === 'DELIVERED' && order.paymentStatus === 'PENDING' ? 'PAID' : undefined;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: newStatus,
        ...(paymentStatusUpdate && { paymentStatus: paymentStatusUpdate }),
      },
    });

    if (paymentStatusUpdate) {
      await prisma.payment.update({
        where: { orderId },
        data: { status: 'PAID' },
      });
    }

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Order Update: ${order.orderNumber}`,
        message: `Your order from ${order.shop.shopName} status is now: ${newStatus.replace(/_/g, ' ')}.`,
        type: 'ORDER',
        orderId: order.id,
      },
    });

    return updated;
  }
}

module.exports = new OrderService();
