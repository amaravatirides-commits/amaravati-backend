// middleware/adminMiddleware.js
const jwt = require('jsonwebtoken'); 
const Admin = require('../models/Admin');

// Middleware to protect admin routes
async function protectAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin user from DB (exclude password)
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = { protectAdmin };
