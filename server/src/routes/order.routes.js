const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');

// All order endpoints require authentication
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getCustomerOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
