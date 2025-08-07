const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found.' });
      }

      req.admin = admin;
      next();
    } catch (err) {
      console.error('❌ Admin auth failed:', err.message);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
      }

      return res.status(401).json({ message: 'Authentication failed.' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided.' });
  }
};

module.exports = { protectAdmin };
