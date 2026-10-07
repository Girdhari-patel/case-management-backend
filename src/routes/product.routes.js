const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/product.controller');

// GET /products/search?productName=para&limit=20
router.get('/search', searchProducts);

module.exports = router;
