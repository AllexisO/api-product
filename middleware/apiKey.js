const pool = require('../config/database');

async function validateApiKey(req,res,next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API Key required in x-api-key header'
        });
    }

    try {
        const query = `SELECT * FROM api_keys WHERE api_key = $1 AND is_active = true`;
        const result = await pool.query(query, [apiKey]);

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or inactive API key'
            });
        }

        await pool.query('UPDATE api_keys SET last_used = NOW() WHERE api_key = $1', [apiKey]);

        req.apiKey = result.rows[0];
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error validation API Key'
        });
    }
}

module.exports = { validateApiKey };
