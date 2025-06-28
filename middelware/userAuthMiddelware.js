const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function userAuthMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded._id);
        if (!user) return res.status(400).json({ message: 'User Not found' });

        req.user = decoded; 
        next();
    } catch (err) {
        console.log("auth middleware error:", err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = userAuthMiddleware;
