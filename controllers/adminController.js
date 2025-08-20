const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Driver = require('../models/driver');
const Ride = require('../models/ride');

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ admin: { id: admin._id, email: admin.email }, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('user', 'name email')
      .populate('driver', 'name vehicleNumber');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
