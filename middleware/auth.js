const jwt = require('jsonwebtoken');

function authenticationToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer Token

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access Token is Required!'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or Expired token'
            });
        }

        req.user = user;
        next();
    });
}

module.exports = { authenticationToken };