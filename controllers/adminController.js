const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

// 🔐 Login admin
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials (admin not found).' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials (password mismatch).' });

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
};

// 👥 Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// 🚗 Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drivers.' });
  }
};

// 🛺 Get all rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('user', 'name mobile')
      .populate('driver', 'name mobile');
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rides.' });
  }
};

// 📊 Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ status: { $ne: 'completed' } });
    const completedRides = await Ride.countDocuments({ status: 'completed' });

    const totalEarningsAgg = await Ride.aggregate([
      { $match: { fare: { $exists: true } } },
      { $group: { _id: null, total: { $sum: "$fare" } } }
    ]);
    const totalEarnings = totalEarningsAgg[0]?.total || 0;

    res.status(200).json({
      totalUsers,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      totalEarnings
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics.' });
  }
};

// ❌ Cancel a ride by Admin
const cancelRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({ message: 'Ride already completed or cancelled' });
    }

    ride.status = 'cancelled_by_admin';
    await ride.save();

    res.status(200).json({ message: 'Ride cancelled by admin successfully' });
  } catch (error) {
    console.error('❌ Cancel ride error:', error);
    res.status(500).json({ message: 'Failed to cancel ride' });
  }
};

module.exports = {
  loginAdmin,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  getDashboardStats,
  cancelRideByAdmin, // ✅ Add this
};
