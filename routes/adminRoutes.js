const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

const {
  loginAdmin,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  getDashboardStats,
  cancelRideByAdmin, // ✅ New: Cancel ride
} = require('../controllers/adminController');

// 🔐 Admin Login
router.post('/login', loginAdmin);

// ✅ Get all users
router.get('/users', protectAdmin, getAllUsers);

// ✅ Get all drivers
router.get('/drivers', protectAdmin, getAllDrivers);

// ✅ Get all rides
router.get('/rides', protectAdmin, getAllRides);

// 📊 Dashboard statistics
router.get('/dashboard', protectAdmin, getDashboardStats);

// ❌ Cancel a ride (admin action)
router.put('/rides/:id/cancel', protectAdmin, cancelRideByAdmin);

module.exports = router;
