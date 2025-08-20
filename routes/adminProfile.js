const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // Adjust path if needed
const authMiddleware = require('../middleware/auth'); // Your auth middleware
const bcrypt = require('bcryptjs');

// GET /api/admin/profile - Get admin profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/profile - Update admin profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
