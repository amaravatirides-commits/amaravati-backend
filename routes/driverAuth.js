const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Driver Registration
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('vehicle').notEmpty().withMessage('Vehicle type is required'),
  ],
  validateRequest,
  async (req, res) => {
    const { name, email, phone, password, vehicle } = req.body;

    try {
      let driver = await Driver.findOne({ email });
      if (driver) return res.status(400).json({ message: 'Driver already exists' });

      driver = new Driver({ name, email, phone, password, vehicle });
      await driver.save();

      const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        token,
        driver: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          vehicle: driver.vehicle,
        },
      });
    } catch (err) {
      console.error('Driver registration error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Driver Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const driver = await Driver.findOne({ email });
      if (!driver) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await driver.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        token,
        driver: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          vehicle: driver.vehicle,
        },
      });
    } catch (err) {
      console.error('Driver login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;