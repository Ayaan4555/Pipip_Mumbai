const express = require("express");
const router = express.Router();
const {
  createRentalRequest,
  getAllRentalRequests,
  updateRentalStatus,
  getServer,
} = require("../controllers/rentalController");

router.post("/", createRentalRequest);
router.get("/admin", getAllRentalRequests);
router.put("/:id/status", updateRentalStatus);
router.get("/", getServer);

module.exports = router;
