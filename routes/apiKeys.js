const express = require('express');
const router = express.Router();
const { generateApiKey, listApiKeys, revokeApiKey } = require('../controllers/apiKeyController');
const { authenticationToken } = require('../middleware/auth');

// All operations with API keys require JWT Token (admin only)
router.post('/generate', authenticationToken, generateApiKey);
router.get('/list', authenticationToken, listApiKeys);
router.delete('./:id', authenticationToken, revokeApiKey);

module.exports = router;