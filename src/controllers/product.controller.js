const Product = require('../models/Product');

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 20;


/**
 * GET /products/search?productName=para&limit=20
 *
 * Case-insensitive search on productName using a MongoDB regex.
 * Always caps results at MAX_LIMIT (20) regardless of requested limit,
 * to keep responses fast for the dropdown UI.
 */
const searchProducts = async (req, res) => {
  try {
    const { productName = '', limit } = req.query;

    // Parse and clamp the limit between 1 and MAX_LIMIT
    let parsedLimit = parseInt(limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = DEFAULT_LIMIT;
    }
    parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

    // Build query filter
    const filter = {};
    if (productName && productName.trim().length > 0) {
      // Escape regex special characters to avoid ReDoS / invalid patterns
      const escaped = productName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.productName = { $regex: escaped, $options: 'i' };
    }

    const products = await Product.find(filter)
      .select('_id productCode productName')
      .limit(parsedLimit)
      .lean();
      console.log(`Found ${products.length} products for search term "${productName}" with limit ${parsedLimit}`);
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message,
    });
  }
};

module.exports = {
  searchProducts,
};
