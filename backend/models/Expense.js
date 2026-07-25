const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    expense_date: {
      type: Date,
      required: true,
    },
    expense_name: {
      type: String,
      required: true,
      trim: true,
    },
    expense_category: {
      type: String,
      required: true,
      enum: [
        "Marketing",
        "Partner Share",
        "Inventory",
        "Vehicle Service",
        "Documentation",
        "Fine",
        "Penalty",
        "IT and Subscriptions",
        "Office Rent / Utilities",
        "Payroll",
        "Other",
      ],
    },
    expense_done_by: {
      type: String,
      required: true,
      trim: true,
    },
    vendor_receiver_name: {
      type: String,
      required: true,
      trim: true,
    },
    expense_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    approver_name: {
      type: String,
      required: true,
      trim: true,
    },
    invoice_proofs: {
      type: [String],
      default: [],
    },
    payment_proof: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", ExpenseSchema);