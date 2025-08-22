const Driver = require('../models/Driver');  // 👈 Case fixed
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, password, vehicleNumber } = req.body;

    if (!name || !email || !password || !vehicleNumber) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const driverExists = await Driver.findOne({ email });
    if (driverExists) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const driver = await Driver.create({
      name,
      email,
      password: hashedPassword,
      vehicleNumber,
      isAvailable: false,
    });

    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        vehicleNumber: driver.vehicleNumber,
        isAvailable: driver.isAvailable
      },
      token
    });
  } catch (error) {
    console.error('Error in registerDriver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Driver login
exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        vehicleNumber: driver.vehicleNumber,
        isAvailable: driver.isAvailable
      },
      token
    });
  } catch (error) {
    console.error('Error in loginDriver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get driver profile (protected)
exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error in getDriverProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update availability status (protected)
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }

    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({ message: 'Availability updated', isAvailable: driver.isAvailable });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
