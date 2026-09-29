const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes under /api/admin require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Shop management
router.get('/shops', shopController.getAllShopsForAdmin);
router.patch('/shops/:id/status', shopController.updateVerification);

module.exports = router;
