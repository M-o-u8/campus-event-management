const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Get user profile
router.get('/profile', authenticateToken, AuthController.getProfile);

// Update user profile
router.put('/profile', authenticateToken, AuthController.updateProfile);

// Switch user role
router.put('/switch-role', authenticateToken, AuthController.switchRole);

// Update user preferences
router.put('/preferences', authenticateToken, AuthController.updatePreferences);

// Get all users (admin only) - moved to dedicated users route
// router.get('/users', authenticateToken, AuthController.getAllUsers);

module.exports = router; 