const express = require('express');
const router = express.Router();
const {
  createCase,
  getCaseById,
  listCases,
  searchCases,
  updateCase,
} = require('../controllers/case.controller');
 
// GET /api/cases/search?caseNumber=...&patientInitials=...  (Case Search button)
router.get('/search', searchCases);
 
// GET /api/cases?page=1&limit=20
router.get('/', listCases);
 
// GET /api/cases/:id
router.get('/:id', getCaseById);
 
// POST /api/cases  (Case registration form submit)
router.post('/', createCase);

router.put("/:id", updateCase);
 
router.put("/:id", async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;
 