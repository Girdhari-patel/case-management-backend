const MasterData = require('../models/MasterData');

/**
 * GET /api/master-data/:category
 *
 * Returns all { value, label } options for a given dropdown category
 * (e.g. "title", "outcome"). These lists are small and fixed, so no
 * pagination is needed — just a sorted list, straight from the DB
 * (never hardcoded on the frontend, so a category's values can be
 * changed centrally without a frontend deploy).
 */
const getMasterDataByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'category param is required',
      });
    }

    const options = await MasterData.find({ category: category.toLowerCase().trim() })
      .select('_id value label sortOrder')
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      category: category.toLowerCase().trim(),
      count: options.length,
      data: options,
    });
  } catch (error) {
    console.error('Error fetching master data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch master data',
      error: error.message,
    });
  }
};

module.exports = {
  getMasterDataByCategory,
};
