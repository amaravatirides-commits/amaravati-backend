const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Admin login
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
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        token,
        admin: { id: admin._id, name: admin.name, email: admin.email },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;