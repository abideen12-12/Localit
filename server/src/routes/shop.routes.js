const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');

// Public endpoints
router.get('/', shopController.getPublicShops);
router.get('/:id', shopController.getShopById);

module.exports = router;
