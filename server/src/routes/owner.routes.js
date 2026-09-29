const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const productController = require('../controllers/product.controller');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes under /api/owner require SHOP_OWNER role
router.use(authenticate, authorize('SHOP_OWNER'));

// Dashboard metrics
router.get('/dashboard', dashboardController.getOwnerDashboard);
router.get('/orders', dashboardController.getOwnerOrders);

// Shop profile management
router.get('/shop', shopController.getOwnerShop);
router.post('/shop', shopController.saveOwnerShop);
router.put('/shop', shopController.saveOwnerShop);
router.patch('/shop/status', shopController.updateOwnerShopStatus);

// Product & Inventory management
router.get('/products', productController.getOwnerProducts);
router.post('/products', productController.createOwnerProduct);
router.put('/products/:id', productController.updateOwnerProduct);
router.delete('/products/:id', productController.deleteOwnerProduct);

module.exports = router;
