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
const { protect } = require("../middelware/auth");

// Public
router.get("/", getBikes);

// Admin
// router.post("/", upload.single("image_url"), createBike);

router.post("/", protect , upload.fields([
  { name: 'image_url', maxCount: 1 },
  { name: 'extra_images', maxCount: 5 }
]), createBike);

// router.put("/:id", upload.single("image_url"), updateBike);

router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "extra_images", maxCount: 5 },
  ]),
  updateBike,
);
router.delete("/:id",protect , deleteBike);
router.get("/:id",getSingleBike);

module.exports = router;

