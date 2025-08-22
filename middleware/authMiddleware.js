// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corrected import path
const Driver = require('../models/driver');
const Admin = require('../models/admin');

const authMiddleware = async (req, res, next) => {
  let token;

  // Expect token in header: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token belongs to a User
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.userType = 'user';
        return next();
      }

      // Check if token belongs to a Driver
      const driver = await Driver.findById(decoded.id).select('-password');
      if (driver) {
        req.user = driver;
        req.userType = 'driver';
        return next();
      }

      // Check if token belongs to an Admin
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        req.user = admin;
        req.userType = 'admin';
        return next();
      }

      // If no matching user found
      return res.status(401).json({ message: 'User not found' });
    } catch (error) {
      console.error('Auth Middleware error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    // If token missing
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

module.exports = authMiddleware;