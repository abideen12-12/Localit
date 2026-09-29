const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes under /api/admin require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Shop management
router.get('/shops', shopController.getAllShopsForAdmin);
router.patch('/shops/:id/status', shopController.updateVerification);

// Category management
router.get('/categories', categoryController.getAllCategoriesForAdmin);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;
