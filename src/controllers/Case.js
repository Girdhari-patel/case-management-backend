const express = require("express");
const mongoose = require("mongoose");
const Case = require("../models/Case");

const router = express.Router();

// undefined / "" fields hata do taaki DB me kachra na jaye
const clean = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined && v !== "" && v !== null)
  );

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid case id" });
  }
  next();
};

// CREATE  -> POST /api/cases
router.post("/", async (req, res) => {
  try {
    const doc = await Case.create(clean(req.body));
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    const status = err.name === "ValidationError" || err.name === "CastError" ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// LIST + SEARCH -> GET /api/cases?caseNumber=..&patientInitials=..&page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const query = {};

    const textFields = [
      "caseNumber", "referenceNumber", "regulatoryCaseNumber", "otherSenderCaseNumber",
      "patientId", "patientInitials", "firstName", "lastName", "reporterEmail",
      "genericName", "manufacturer", "reportedTerm", "reactionEvent", "journal", "author",
    ];
    textFields.forEach((f) => {
      if (filters[f]) query[f] = { $regex: filters[f], $options: "i" };
    });

    ["gender", "outcome", "primarySourceCountry"].forEach((f) => {
      if (filters[f]) query[f] = filters[f];
    });

    if (filters.productName) query.productName = { $in: [].concat(filters.productName) };

    const p = Math.max(parseInt(page), 1);
    const l = Math.min(Math.max(parseInt(limit), 1), 100);

    const [data, total] = await Promise.all([
      Case.find(query).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Case.countDocuments(query),
    ]);

    res.json({ success: true, total, page: p, pages: Math.ceil(total / l), data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// READ ONE -> GET /api/cases/:id
router.get("/:id", checkId, async (req, res) => {
  const doc = await Case.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Case not found" });
  res.json({ success: true, data: doc });
});

// UPDATE -> PUT /api/cases/:id
router.put("/:id", checkId, async (req, res) => {
  try {
    const doc = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ success: false, message: "Case not found" });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE -> DELETE /api/cases/:id
router.delete("/:id", checkId, async (req, res) => {
  const doc = await Case.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Case not found" });
  res.json({ success: true, message: "Case deleted" });
});

module.exports = router;
