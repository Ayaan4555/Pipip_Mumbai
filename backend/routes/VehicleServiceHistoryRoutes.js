const express = require("express");
const {
  createServiceRecord,
  getServiceRecords,
  getBikeServiceTimeline,
  updateServiceRecord,
  deleteServiceRecord,
} = require("../controllers/VehicleServiceHistoryController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Apply auth protection middleware to all routes
router.use(protect);

router.post(
  "/",
  upload.single("bill_file"),
  createServiceRecord
);

router.get("/", getServiceRecords);

router.get("/bike/:bikeId", getBikeServiceTimeline);

router.put(
  "/:id",
  upload.single("bill_file"),
  updateServiceRecord
);

router.delete("/:id", deleteServiceRecord);

module.exports = router;