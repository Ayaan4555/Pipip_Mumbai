const express = require("express");
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
} = require("../controllers/Expensecontroller");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

// POST create expense (with optional attachments)
router.post(
  "/",
  upload.fields([
    { name: "invoice_proof", maxCount: 5 },
    { name: "payment_proof", maxCount: 1 },
  ]),
  createExpense
);

// PUT update expense (with optional attachments)
router.put(
  "/:id",
  upload.fields([
    { name: "invoice_proof", maxCount: 5 },
    { name: "payment_proof", maxCount: 1 },
  ]),
  updateExpense
);

// GET all expenses (filtered by user role and search query)
router.get("/", getExpenses);

// GET single expense by id
router.get("/:id", getExpenseById);

module.exports = router;