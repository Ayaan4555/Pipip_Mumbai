const express = require("express");
const {
  getActiveAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreas
} = require("../controllers/areaController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", getActiveAreas);
// router.post("/", createArea);
// router.put("/:id", updateArea);
// router.delete("/:id", deleteArea);

// Admin Only
router.post("/", protect, adminOnly, createArea);
router.put("/:id", protect, adminOnly, updateArea);
router.delete("/:id", protect, adminOnly, deleteArea);
router.get("/areas", getAreas);

module.exports = router;

