const express = require("express");
const {
  getActiveAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreas
} = require("../controllers/areaController");

const router = express.Router();

router.get("/", getActiveAreas);
router.post("/", createArea);
router.put("/:id", updateArea);
router.delete("/:id", deleteArea);
router.get("/areas", getAreas);

module.exports = router;

