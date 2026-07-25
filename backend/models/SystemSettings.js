const mongoose = require("mongoose");

const SystemSettingsSchema = new mongoose.Schema(
  {
    admin_emails: {
      type: [String],
      default: [],
    },
    auto_send_enabled: {
      type: Boolean,
      default: true,
    },
    report_time: {
      type: String,
      default: "20:00", // HH:MM format
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);