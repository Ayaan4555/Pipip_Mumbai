const express = require("express");
const { login, register, getStaff, deleteStaff, getMe , updateStaffAreas} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();


// Public Routes
router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);

// Protected Routes (Required Token)
// getStaff is used by Settings.jsx to show the team
router.get("/staff", protect, adminOnly, getStaff);

// deleteStaff is used by the Trash icon in Settings.jsx
router.delete("/:id", protect, adminOnly, deleteStaff);

// updateStaffAreas is used to assign/unassign areas
router.put("/:id/areas", protect, adminOnly, updateStaffAreas);

module.exports = router;