const express = require("express");
const {
  getTodayReport,
  getHistoricalReports,
  getSettings,
  updateSettings,
} = require("../controllers/dailyReportController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Apply protect and adminOnly middleware to all routes below
router.use(protect);
router.use(adminOnly);

// GET live today's automated totals
router.get("/today", getTodayReport);

// GET historical reports list
router.get("/history", getHistoricalReports);

// GET report configuration settings
router.get("/settings", getSettings);

// POST/PUT update configuration settings
router.post("/settings", updateSettings);

module.exports = router;