const verifyToken = require('./authMiddleware');

function adminAuthMiddleware(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access denied' });
    }
    next();
  });
}

module.exports = adminAuthMiddleware;
