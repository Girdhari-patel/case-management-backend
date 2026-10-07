const express = require('express');
const router = express.Router();
const { getMasterDataByCategory } = require('../controllers/masterData.controller');

// GET /api/master-data/title
// GET /api/master-data/outcome
router.get('/:category', getMasterDataByCategory);

module.exports = router;
