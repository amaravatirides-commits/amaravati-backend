// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (protected)
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;