const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
} = require('../validators/auth.validator');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes (any authenticated user)
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, validateChangePassword, authController.changePassword);

module.exports = router;
