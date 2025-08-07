const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const protectUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user from the token payload to the request
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('User Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    } else { // This 'else' block ensures a response if no token is provided
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = { protectUser };