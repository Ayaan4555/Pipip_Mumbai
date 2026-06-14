// const express = require("express");
// const {
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   updateBooking,
//   updateBookingStatus,
//   deleteBooking,
// } = require("../controllers/Bookingcontroller");
// const router = express.Router();
// const upload = require("../middleware/upload");

// // CREATE booking
// // router.post("/", createBooking);
// router.post("/",upload.single("aadhaar_image"), createBooking);


// // ADMIN ONLY

// router.get("/", getAllBookings);
// router.get("/:id", getBookingById);


// router.put("/:id", updateBooking);
// router.patch("/:id/status", updateBookingStatus);


// router.delete("/:id", deleteBooking);

// module.exports = router;

const express = require("express");
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  adminCreateBooking,
  extendBooking,
  assignBikeToBooking,
} = require("../controllers/Bookingcontroller");
const { protect, adminOnly } = require("../middelware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

// CREATE booking
router.post("/", createBooking);
// router.post("/admin",upload.none(), adminCreateBooking);


// ADMIN ONLY

// router.get("/", getAllBookings);
// router.get("/:id", getBookingById);

// router.put("/:id", updateBooking);
// router.patch("/:id/status", updateBookingStatus);

// router.put(
//   "/:id",
//   upload.single("payment_screenshot"),
//   updateBooking
// );

// router.delete("/:id", deleteBooking);

// Protected Routes
router.post("/admin", protect, upload.any(), adminCreateBooking);
router.get("/", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, upload.single("payment_screenshot"), updateBooking);
router.patch("/:id/status", protect, updateBookingStatus);
router.put("/:id/assign-bike", protect, assignBikeToBooking);

// Admin Only
router.delete("/:id", protect, adminOnly, deleteBooking);

router.patch(
  "/:id/extend",
  extendBooking
);

// router.put("/:id/assign-bike", assignBikeToBooking);

module.exports = router;