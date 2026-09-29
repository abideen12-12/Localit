const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Public categories listing
router.get('/', categoryController.getPublicCategories);

module.exports = router;
