const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from the header
    const token = req.header('Authorization')?.split(' ')[1]; // Expects "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret_key');
        req.admin = decoded; // Add admin payload to the request object
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};