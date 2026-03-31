const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createBike,
  getBikes,
  updateBike,
  deleteBike,
  getSingleBike,
} = require("../controllers/bikeController");

// Public
router.get("/", getBikes);

// Admin
// router.post("/", upload.single("image_url"), createBike);

router.post("/", upload.fields([
  { name: 'image_url', maxCount: 1 },
  { name: 'extra_images', maxCount: 5 }
]), createBike);

// router.put("/:id", upload.single("image_url"), updateBike);

router.put(
  "/:id",
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "extra_images", maxCount: 5 },
  ]),
  updateBike,
);
router.delete("/:id", deleteBike);
router.get("/:id",getSingleBike);

module.exports = router;

