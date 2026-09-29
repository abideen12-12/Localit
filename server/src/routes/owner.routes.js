const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes under /api/owner require SHOP_OWNER role
router.use(authenticate, authorize('SHOP_OWNER'));

// Shop profile management
router.get('/shop', shopController.getOwnerShop);
router.post('/shop', shopController.saveOwnerShop);
router.put('/shop', shopController.saveOwnerShop);
router.patch('/shop/status', shopController.updateOwnerShopStatus);

module.exports = router;
