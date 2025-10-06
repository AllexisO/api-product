const crypto = require('crypto');
const client = require('../config/database');

const generateApiKey = async (req, res) => {
    const { key_name } = req.body;

    if(!key_name) {
        return res.status(400).json({
            success: false,
            error: 'key_name is required'
        });
    }

    const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

    const query = `INSERT INTO api_keys (key_name, api_key) VALUES ($1, $2) RETURNING id, key_name, api_key, created_at`;

    try {
        const result = await client.query(query, [key_name, apiKey]);
        
        res.json({
            success: true,
            message: 'Save this key - it will not be shown again!',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate API key'
        });
    }
}