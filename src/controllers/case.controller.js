const mongoose = require('mongoose');
const Case = require('../models/Case');
const Product = require('../models/Product');
 
// Fields that come in as date strings from the frontend but must be
// stored as real Date objects. Empty strings are normalized to
// undefined so they don't fail Date casting.
const DATE_FIELDS = [
  'companyReceiptDate',
  'centreReceivedDate',
  'dateOfBirth',
  'reportDate',
  'eventOnsetDate',
  'publicationDate',
  'pregnancyDate',
];
 
const normalizePayload = async (body) => {
  const payload = { ...body };
 
  DATE_FIELDS.forEach((field) => {
    if (payload[field] === '' || payload[field] === undefined) {
      delete payload[field];
    }
  });
 
  // productName may arrive as a single value or an array, and each entry
  // may be either a Product _id or a plain product name (the frontend has
  // sent both). Normalize to an array of strings; where an entry is a
  // valid Product _id, resolve it to the product's name for consistency.
  if (payload.productName && !Array.isArray(payload.productName)) {
    payload.productName = [payload.productName];
  }
  if (Array.isArray(payload.productName)) {
    const resolved = await Promise.all(
      payload.productName
        .filter((entry) => entry !== undefined && entry !== null && entry !== '')
        .map(async (entry) => {
          if (mongoose.Types.ObjectId.isValid(entry)) {
            const product = await Product.findById(entry).select('productName').lean();
            return product ? product.productName : String(entry);
          }
          return String(entry);
        })
    );
    payload.productName = resolved;
  }
 
  return payload;
};
 
/**
 * POST /api/cases
 * Saves a new case with all sections of the registration form.
 */
const createCase = async (req, res) => {
  try {
    const { body } = req;
    console.log('Received case creation request with body:', body.patientId);
    const payload = await normalizePayload(req.body);
    const newCase = await Case.create(payload);
 
    return res.status(201).json({
      success: true,
      message: 'Case saved successfully',
      data: newCase,
    });
  } catch (error) {
    console.error('Error creating case:', error);
 
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid case data',
        error: error.message,
      });
    }
 
    return res.status(500).json({
      success: false,
      message: 'Failed to save case',
      error: error.message,
    });
  }
};
 
/**
 * GET /api/cases/:id
 */
const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case id' });
    }
 
    const foundCase = await Case.findById(id);
    if (!foundCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
 
    return res.status(200).json({ success: true, data: foundCase });
  } catch (error) {
    console.error('Error fetching case:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case', error: error.message });
  }
};
 
/**
 * GET /api/cases?page=1&limit=20
 * Plain paginated listing, newest first.
 */
const listCases = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    limit = parseInt(limit, 10) > 0 ? Math.min(parseInt(limit, 10), 100) : 20;
    const skip = (page - 1) * limit;
 
    const [data, total] = await Promise.all([
      Case.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(),
    ]);
 
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error listing cases:', error);
    return res.status(500).json({ success: false, message: 'Failed to list cases', error: error.message });
  }
};
 
/**
 * GET /api/cases/search — powers the "Case Search" (duplicate-check) button.
 * Matches on any of the provided fields; all are optional and combined with AND.
 */
const searchCases = async (req, res) => {
  try {
    const searchableFields = [
      'caseNumber',
      'referenceNumber',
      'regulatoryCaseNumber',
      'otherSenderCaseNumber',
      'patientId',
      'patientInitials',
      'reporterEmail',
      'reporterPhone',
    ];
 
    const filter = {};
    searchableFields.forEach((field) => {
      const value = req.query[field];
      if (value && String(value).trim()) {
        filter[field] = { $regex: String(value).trim(), $options: 'i' };
      }
    });
 
    const results = await Case.find(filter).sort({ createdAt: -1 }).limit(50).lean();
 
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error searching cases:', error);
    return res.status(500).json({ success: false, message: 'Failed to search cases', error: error.message });
  }
};
 
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case id' });
    }

    const payload = await normalizePayload(req.body);
    const updatedCase = await Case.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (!updatedCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase,
    });
  } catch (error) {
    console.error('Error updating case:', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid case data',
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update case',
      error: error.message,
    });
  }
}
module.exports = {
  createCase,
  getCaseById,
  listCases,
  searchCases,
  updateCase,
};
 