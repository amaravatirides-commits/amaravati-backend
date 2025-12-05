// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  let token;

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

      // No matching user found
      return res.status(401).json({ message: 'User not found' });

    } catch (error) {
      // ✅ Handle expired token separately
      if (error.name === 'TokenExpiredError') {
        console.warn('⚠️ JWT expired:', error.expiredAt);
        return res.status(401).json({ message: 'Token expired' });
      }

      // Log unexpected errors
      console.error('Auth Middleware error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

module.exports = authMiddleware;
