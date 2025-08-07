const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const { protect: protectDriver } = require('../middleware/driverAuthMiddleware');

// ✅ Driver Registration
router.post('/register', async (req, res) => {
    const { name, mobile, password, vehicleNumber } = req.body;

    if (!name || !mobile || !password) {
        return res.status(400).json({ message: 'Name, mobile, and password are required.' });
    }

    try {
        const existingDriver = await Driver.findOne({ mobile });
        if (existingDriver) {
            return res.status(400).json({ message: 'Mobile already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDriver = new Driver({
            name,
            mobile,
            password: hashedPassword,
            vehicleNumber
        });

        await newDriver.save();

        res.status(201).json({ message: 'Driver registered successfully.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ✅ Driver Login
router.post('/login', async (req, res) => {
    const { mobile, password } = req.body;

    try {
        const driver = await Driver.findOne({ mobile });
        if (!driver) {
            return res.status(401).json({ message: 'Invalid mobile or password.' });
        }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid mobile or password.' });
        }

        const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful.',
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                mobile: driver.mobile,
                vehicleNumber: driver.vehicleNumber
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ✅ Get Driver Profile (Protected)
router.get('/profile', protectDriver, async (req, res) => {
    if (!req.driver) {
        return res.status(404).json({ message: 'Driver not found after authentication.' });
    }

    res.status(200).json({
        id: req.driver._id,
        name: req.driver.name,
        mobile: req.driver.mobile,
        vehicleNumber: req.driver.vehicleNumber
    });
});

// ✅ Update Driver Location (Protected)
router.put('/update-location', protectDriver, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ message: 'Latitude and longitude must be numbers.' });
        }

        const driver = await Driver.findById(req.driver._id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found.' });
        }

        driver.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        await driver.save();

        res.status(200).json({ message: 'Location updated successfully.' });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Server error while updating location.' });
    }
});

// ✅ Get Driver's Location by ID (Public)
router.get('/:id/location', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver || !driver.location) {
            return res.status(404).json({ message: 'Driver or location not found.' });
        }

        res.status(200).json({
            latitude: driver.location.coordinates[1],
            longitude: driver.location.coordinates[0],
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ message: 'Server error while fetching location.' });
    }
});

// ✅ TEMP: List all drivers (for testing only — remove in production)
router.get('/all', async (req, res) => {
    try {
        const drivers = await Driver.find().select('-password');
        res.json(drivers);
    } catch (error) {
        console.error('Error listing drivers:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
