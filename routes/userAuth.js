const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to handle validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// User Registration
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('mobile')
      .notEmpty()
      .withMessage('Mobile is required')
      .isMobilePhone('any')
      .withMessage('Valid mobile number required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  async (req, res, next) => {
    const { name, email, mobile, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ success: false, message: 'User already exists' });

      user = new User({ name, email, mobile, password });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
      });
    } catch (err) {
      next(err);
    }
  }
);

// User Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;