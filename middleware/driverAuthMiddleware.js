const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.driver = await Driver.findById(decoded.id).select('-password');

            if (!req.driver) {
                return res.status(401).json({ message: 'Not authorized, driver not found.' });
            }

            next();
        } catch (error) {
            console.error('Driver token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
