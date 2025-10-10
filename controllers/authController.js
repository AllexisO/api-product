const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    const token = jwt.sign(
        { username: username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h'}
    );

    res.json({
        success: true,
        token: token,
        expiresIn: '24h'
    });
}

module.exports = { login }
