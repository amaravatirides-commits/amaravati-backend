// routes/rideRoutes.js 
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// ================= User & Driver Routes =================

// User requests a ride
router.post('/request', authMiddleware, rideController.requestRide);

// Driver accepts a ride
router.patch('/accept/:rideId', authMiddleware, rideController.acceptRide);

// Update ride status (start, complete, cancel)
router.patch('/status/:rideId', authMiddleware, rideController.updateRideStatus);

// Get ride history for a user
router.get('/user', authMiddleware, rideController.getUserRides);

// Get ride history for a driver
router.get('/driver', authMiddleware, rideController.getDriverRides);

// ================= Admin Routes =================

// Get all rides (admin)
router.get('/admin/rides', protectAdmin, rideController.getAllRides);

// Get single ride by ID (admin)
router.get('/admin/rides/:rideId', protectAdmin, rideController.getRideById);

// Update ride (admin: status)
router.put('/admin/rides/:rideId', protectAdmin, rideController.updateRideByAdmin);

// Delete ride (admin)
router.delete('/admin/rides/:rideId', protectAdmin, rideController.deleteRideByAdmin);

module.exports = router;
