const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

async function protectDriver(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const driver = await Driver.findById(decoded.id).select('-password');
    if (!driver) {
      return res.status(401).json({ message: 'Driver not found' });
    }
    req.driver = driver;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = { protectDriver };