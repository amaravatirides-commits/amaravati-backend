const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

// Register driver
router.post('/register', driverController.registerDriver);

// Login driver
router.post('/login', driverController.loginDriver);

// Get driver profile (protected)
router.get('/profile', authMiddleware, driverController.getDriverProfile);

// Update availability (protected)
router.patch('/availability', authMiddleware, driverController.updateAvailability);

module.exports = router;