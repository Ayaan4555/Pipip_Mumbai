const mongoose = require("mongoose");

const rentalRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    pickupLocation: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    message: String,
    status: { type: String, default: "pending" , enum: ["pending", "confirmed", "cancelled"], }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentalRequest", rentalRequestSchema);
