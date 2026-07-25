const express = require("express");
const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/DailyAccountcontroller");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Apply protect and adminOnly middleware to all routes below
router.use(protect);
router.use(adminOnly);

// CREATE operational balance entry
router.post("/", createEntry);

// GET all entries with search/filter queries
router.get("/", getEntries);

// UPDATE operational balance entry
router.put("/:id", updateEntry);

// DELETE operational balance entry
router.delete("/:id", deleteEntry);

module.exports = router;