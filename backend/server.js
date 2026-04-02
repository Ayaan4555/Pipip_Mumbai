// const dotenv = require("dotenv");
// const express = require("express");
// const cors = require("cors");

// dotenv.config();
// const connectDB = require("./config/db");
// const areaRoutes = require("./routes/areaRoutes"); 


// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/rentals", require("./routes/rentalRoutes"));
// app.use("/api/bikes", require("./routes/bikeRoutes"));

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({
//     message: err.message || "Server error",
//   });
// });



// app.use("/api/areas", areaRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);


// });

// 🔥 ENV MUST BE LOADED FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const areaRoutes = require("./routes/areaRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const paymentRoutes =
  require("./routes/paymentRoutes");

// Connect to MongoDB
connectDB();

const app = express();



// Middlewares
app.use(cors());



app.use(express.json());

app.use(
  "/api/payment",
  paymentRoutes
);



// Routes
app.use("/api/areas", areaRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/customers", require("./routes/CustomerRoutes"));
app.use("/api/bookings", require("./routes/BookingRoutes"));
app.use("/api/availability", require("./routes/AvailabilityRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Global error handler (IMPORTANT)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: err.message || "Server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

