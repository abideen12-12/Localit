const orderService = require('../services/order.service');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { addressId, paymentMethod, couponCode } = req.body;
      if (!addressId) {
        return res.status(400).json({ success: false, message: 'Delivery address is required.' });
      }

      const order = await orderService.createOrder(req.user.id, {
        addressId,
        paymentMethod,
        couponCode,
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrders(req, res, next) {
    try {
      const orders = await orderService.getCustomerOrders(req.user.id);
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.params.id, req.user.id, reason);
      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully and stock restored.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { orderStatus } = req.body;
      if (!orderStatus) {
        return res.status(400).json({ success: false, message: 'New orderStatus is required.' });
      }

      const updated = await orderService.updateOrderStatus(
        req.params.id,
        orderStatus,
        req.user.id,
        req.user.role
      );

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${orderStatus}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
