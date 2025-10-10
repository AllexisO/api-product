const jwt = require('jsonwebtoken');
const client = require('../config/database');

async function authenticate(req, res, next) {

    // Checking API key first
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        try {
            const query = `SELECT * FROM api_keys WHERE api_key = $1 AND is_active = true`;
            const result = await client.query(query, [apiKey]);

            if (result.rows.length > 0) {
                await client.query('UPDATE api_keys SET last_used = NOW() WHERE api_key = $1', [apiKey]);
                req.auth = { type: 'api_key', data: result.rows[0] };
                return next();
            }
        } catch (error) {

        }
    };

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer Token

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required (API key or JWT token)'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or Expired token'
            });
        }

        req.auth = { type: 'jwt', data: user };
        next();
    });
}

// module.exports = { authenticationToken };
module.exports = { authenticate, authenticationToken: authenticate };
