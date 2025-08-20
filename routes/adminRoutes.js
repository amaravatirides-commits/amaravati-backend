const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin login
router.post("/login", adminController.loginAdmin);

// Get all users (protected)
router.get("/users", authMiddleware, adminController.getAllUsers);

// Get all drivers (protected)
router.get("/drivers", authMiddleware, adminController.getAllDrivers);

// Get all rides (protected)
router.get("/rides", authMiddleware, adminController.getAllRides);

module.exports = router;
