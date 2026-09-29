const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const productController = require('../controllers/product.controller');

// Public endpoints
router.get('/', shopController.getPublicShops);
router.get('/:id', shopController.getShopById);
router.get('/:shopId/products', productController.getShopProducts);

module.exports = router;
