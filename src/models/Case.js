 const mongoose = require('mongoose');

/**
 * Case model — one document per registered case, covering every
 * section of the "Duplicate Search & Registration" form:
 * Initial Information, Patient Information, Reporter Information,
 * Product Information, Event Information, Literature Information.
 *
 * Fields are kept optional at the schema level (not all sections are
 * mandatory when a case is first created); tighten with `required`
 * once the frontend's own validation rules are finalized.
 */
const caseSchema = new mongoose.Schema(
  {
    // --- Initial Information ---
    caseNumber: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
    regulatoryCaseNumber: { type: String, trim: true },
    otherSenderCaseNumber: { type: String, trim: true },
    companyReceiptDate: { type: Date },
    centreReceivedDate: { type: Date },
    primarySourceCountry: { type: String, trim: true },
    primaryReportType: { type: mongoose.Schema.Types.Mixed }, // number or master-data id, depending on frontend

    // --- Patient Information ---
    patientId: { type: String, trim: true },
    patientInitials: { type: String, trim: true },
    dateOfBirth: { type: Date },
    reportDate: { type: Date },
    gender: { type: String, trim: true },
    ageAtEvent: { type: String, trim: true },
    pregnancyDate: { type: Date }, // shown conditionally on the frontend when Sex = Female

    // --- Reporter Information ---
    title: { type: String, trim: true }, // master-data id or label, as sent by the frontend
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    reporterEmail: { type: String, trim: true, lowercase: true },
    reporterPhone: { type: String, trim: true },

    // --- Product Information ---
    // Sent by the frontend as an array of product identifiers — accepts
    // either a Product _id or a plain product name, since the frontend's
    // multi-select has sent both across different states. Stored as-is;
    // resolved against the Product collection by the controller when possible.
    productName: [{ type: String, trim: true }],
    genericName: { type: String, trim: true },
    manufacturer: { type: String, trim: true },

    // --- Event Information ---
    reportedTerm: { type: String, trim: true },
    reactionEvent: { type: String, trim: true },
    eventOnsetDate: { type: Date },
    outcome: { type: String, trim: true }, // master-data value, e.g. "RECOVERED"

    // --- Literature Information ---
    journal: { type: String, trim: true },
    publicationDate: { type: Date },
    volume: { type: String, trim: true },
    pageNo: { type: String, trim: true },
    author: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Common lookups for the "Case Search" (duplicate search) screen
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ patientInitials: 1 });
caseSchema.index({ reporterEmail: 1 });

module.exports = mongoose.model('Case', caseSchema);