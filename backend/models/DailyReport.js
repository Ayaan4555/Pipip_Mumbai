const mongoose = require("mongoose");

const DailyReportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    total_expense: {
      type: Number,
      required: true,
      default: 0,
    },
    total_amount_received: {
      type: Number,
      required: true,
      default: 0,
    },
    deposit_amount: {
      type: Number,
      required: true,
      default: 0,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyReport", DailyReportSchema);