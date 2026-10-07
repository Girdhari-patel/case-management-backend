const Product = require('../models/Product');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100; // safety cap so nobody can request the whole collection in one page
const DEFAULT_PAGE = 1;
const ALLOWED_SORT_FIELDS = ['productName', 'productCode', 'createdAt'];

/**
 * GET /api/options?search=<query>&page=1&limit=20&sortBy=productName&sortOrder=asc
 *
 * Fully server-side: filtering (regex search), pagination (skip/limit),
 * and sorting all happen in MongoDB. The frontend never filters the
 * 1000+ records itself — it just renders whatever page comes back and
 * requests the next page on scroll.
 */
const getOptions = async (req, res) => {
  try {
    const {
      search = '',
      page,
      limit,
      sortBy = 'productName',
      sortOrder = 'asc',
    } = req.query;

    // --- Pagination params ---
    let parsedPage = parseInt(page, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = DEFAULT_PAGE;
    }

    let parsedLimit = parseInt(limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = DEFAULT_LIMIT;
    }
    parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

    const skip = (parsedPage - 1) * parsedLimit;

    // --- Search filter (case-insensitive regex on productName) ---
    const filter = {};
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.productName = { $regex: escaped, $options: 'i' };
    }

    // --- Sorting (whitelisted fields only) ---
    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'productName';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortDirection };

    // Run the page query and the total count in parallel
    const [data, total] = await Promise.all([
      Product.find(filter)
        .select('_id productCode productName')
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / parsedLimit), 1);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        hasMore: parsedPage < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch options',
      error: error.message,
    });
  }
};

module.exports = {
  getOptions,
};
