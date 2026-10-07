const express = require('express');
const router = express.Router();
const { getOptions } = require('../controllers/options.controller');

// GET /api/options?search=<query>&page=1&limit=20
router.get('/', getOptions);

module.exports = router;
