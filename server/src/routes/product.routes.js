const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Public global search
router.get('/search', productController.searchProductsGlobal);

module.exports = router;
