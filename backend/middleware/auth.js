const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from the Authorization header
    const authHeader = req.header('Authorization');

    // Check if token doesn't exist
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // The token format is "Bearer <token>". We need to extract just the token part.
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token format is invalid' });
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user from the payload to the request object
        req.user = decoded.user;
        
        next(); // Move to the next piece of middleware or the route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

