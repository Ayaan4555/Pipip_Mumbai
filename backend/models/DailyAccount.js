const mongoose = require("mongoose");

const DailyAccountSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    entry_type: {
      type: String,
      required: true,
      enum: ["Morning", "Night"],
    },
    pipip_bank_balance: {
      type: Number,
      required: true,
      min: 0,
    },
    cash_in_hand: {
      type: Number,
      required: true,
      min: 0,
    },
    farhans_bank_balance: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    filled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyAccount", DailyAccountSchema);