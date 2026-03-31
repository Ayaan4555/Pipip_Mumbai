// controllers/booking.controller.js
// const Booking = require("../models/Booking");
// const Customer = require("../models/Customer");
// const Bike = require("../models/Bike");
// exports.createBooking = async (req, res) => {
//   const booking = await Booking.create(req.body);
//   res.status(201).json(booking);
// };


// exports.createBooking = async (req, res) => {
//     console.log("Booking", req.body)
//   try {
//     const {
//       bike_id,
//       start_datetime,
//       end_datetime,
//       is_new_customer,
//       customer_id,
//       customer_name,
//       customer_phone,
//       customer_email,
//       notes,
//     } = req.body;

//     // 1️⃣ Validate dates
//     if (new Date(end_datetime) <= new Date(start_datetime)) {
//       return res.status(400).json({ message: "End date must be after start date" });
//     }

//     // 2️⃣ Resolve customer
//     let finalCustomerId = customer_id;

//     if (is_new_customer === true || is_new_customer === "true") {
//       if (!customer_name || !customer_phone) {
//         return res.status(400).json({ message: "Customer details required" });
//       }

//       const customer = await Customer.create({
//         name: customer_name,
//         phone: customer_phone,
//         email: customer_email || null,
//       });

//       finalCustomerId = customer._id;
//     }

//     if (!finalCustomerId) {
//       return res.status(400).json({ message: "Customer ID missing" });
//     }

//     // 3️⃣ Get bike & calculate amount
//     const bike = await Bike.findById(bike_id);
//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     const hours =
//       (new Date(end_datetime) - new Date(start_datetime)) / (1000 * 60 * 60);

//     const total_amount = Math.ceil(hours) * bike.price_per_hour;

//     // 4️⃣ Create booking
//     const booking = await Booking.create({
//       customer_id: finalCustomerId,
//       bike_id,
//       start_datetime,
//       end_datetime,
//       total_amount,
//       notes,
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error("BOOKING ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };





// /**
//  * GET ALL BOOKINGS (ADMIN)
//  */
// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("customer_id", "name phone email")
//       .populate("bike_id", "model number_plate")
//       .sort({ createdAt: -1 });

//     const formatted = bookings.map((b) => ({
//       ...b.toObject(),
//       customers: b.customer_id,
//       bikes: b.bike_id,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * GET SINGLE BOOKING
//  */
// exports.getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("customer_id", "name phone email")
//       .populate("bike_id", "model number_plate");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json({
//       ...booking.toObject(),
//       customers: booking.customer_id,
//       bikes: booking.bike_id,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * UPDATE BOOKING (ADMIN CAN EDIT DETAILS)
//  */
// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const { start_datetime, end_datetime, total_amount, notes } = req.body;

//     if (start_datetime !== undefined) booking.start_datetime = start_datetime;

//     if (end_datetime !== undefined) booking.end_datetime = end_datetime;

//     if (total_amount !== undefined) booking.total_amount = total_amount;

//     if (notes !== undefined) booking.notes = notes;

//     booking.updated_by_admin = true;

//     await booking.save();

//     res.json({
//       message: "Booking updated successfully",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * UPDATE BOOKING STATUS (FAST ADMIN ACTION)
//  */
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const allowedStatus = [
//       "pending",
//       "confirmed",
//       "active",
//       "completed",
//       "cancelled",
//     ];

//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { status, updated_by_admin: true },
//       { new: true },
//     );

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json({
//       message: "Booking status updated",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * DELETE / CANCEL BOOKING
//  */
// exports.deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     await booking.deleteOne();

//     res.json({ message: "Booking deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/booking.controller.js
const Bike = require("../models/Bike");
const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  const booking = await Booking.create(req.body);
  res.status(201).json(booking);
};


// exports.adminCreateBooking = async (req, res) => {
//   const {
//     bike_id,
//     start_datetime,
//     end_datetime,
//     customer_id,
//     notes,
//   } = req.body;


//   const bike = await Bike.findById(bike_id);
//       if (!bike) return res.status(404).json({ message: "Bike not found" });

//       const hourlyRate = Number(bike.price_per_hour || 0);
//       const start = new Date(start_datetime);
//       const end = new Date(end_datetime);
//       const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
//       const total_amount = hours * hourlyRate;

//       // 3. Create the Booking
//       const booking = await Booking.create({
//         customer_id,
//         bike_id,
//         start_datetime: start,
//         end_datetime: end,
//         total_amount,
//         notes,
//         booking_source: "admin",
//       });

//   res.status(201).json(booking);
  
// }

// exports.adminCreateBooking = async (req, res) => {
//   try {
//     const { bike_id, start_datetime, end_datetime, customer_id, notes } =
//       req.body;

//     const bike = await Bike.findById(bike_id);
//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     const start = new Date(start_datetime);
//     const end = new Date(end_datetime);

//     // 1. Calculate Total Hours
//     const totalHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

//     let total_amount = 0;
//     const hourlyRate = Number(bike.price_per_hour || 0);
//     const dailyRate = Number(bike.price_per_day || 0);

//     // 2. Logic: If 24 hours or more AND a daily rate exists
//     if (totalHours >= 24 && dailyRate > 0) {
//       const days = Math.floor(totalHours / 24);
//       const remainingHours = totalHours % 24;

//       // Calculate: (Full Days * Daily Price) + (Extra Hours * Hourly Price)
//       total_amount = days * dailyRate + remainingHours * hourlyRate;

//       // Optimization: If remaining hours cost more than another full day,
//       // just charge for an extra day (whichever is cheaper)
//       if (remainingHours * hourlyRate > dailyRate) {
//         total_amount = (days + 1) * dailyRate;
//       }
//     } else {
//       // Logic: Less than 24 hours (or no daily rate set)
//       total_amount = totalHours * hourlyRate;
//     }

//     // 3. Create the Booking
//     const booking = await Booking.create({
//       customer_id,
//       bike_id,
//       start_datetime: start,
//       end_datetime: end,
//       total_amount,
//       notes,
//       booking_source: "admin",
//       status: "confirmed", // Or "active" depending on your flow
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error("Booking Error:", error);
//     res.status(500).json({ message: "Server error creating booking" });
//   }
// };


// exports.adminCreateBooking = async (req, res) => {
//   try {

//     const {
//       bike_id,
//       start_datetime,
//       end_datetime,
//       customer_id,

//       customer_name,
//       contact_number,
//       customer_email,
//       customer_location,

//       lead_source,
//       source_name,

//       vehicle_make_model,
//       rental_type,

//       deposit_amount,

//       reference_partner_share,
//       reference_partner_share_given,

//       provider_partner_share,
//       provider_partner_share_given,

//       fuel_quantity,
//       account_manager,

//       remarks,
//       notes,

//       payment_method

//     } = req.body;

//     const bike = await Bike.findById(bike_id);

//     if (!bike) {
//       return res.status(404).json({ message: "Bike not found" });
//     }

//     const start = new Date(start_datetime);
//     const end = new Date(end_datetime);

//     const totalHours = Math.max(
//       1,
//       Math.ceil((end - start) / (1000 * 60 * 60))
//     );

//     let total_amount = 0;

//     const hourlyRate = Number(bike.price_per_hour || 0);
//     const dailyRate = Number(bike.price_per_day || 0);

//     if (totalHours >= 24 && dailyRate > 0) {

//       const days = Math.floor(totalHours / 24);
//       const remainingHours = totalHours % 24;

//       total_amount = days * dailyRate + remainingHours * hourlyRate;

//       if (remainingHours * hourlyRate > dailyRate) {
//         total_amount = (days + 1) * dailyRate;
//       }

//     } else {

//       total_amount = totalHours * hourlyRate;

//     }

//     const booking = await Booking.create({

//       customer_id,
//       bike_id,

//       customer_name,
//       contact_number,
//       customer_email,
//       customer_location,

//       lead_source,
//       source_name,

//       vehicle_make_model,
//       rental_type,

//       start_datetime: start,
//       end_datetime: end,

//       total_amount,

//       deposit_amount: Number(deposit_amount),

//       reference_partner_share: Number(reference_partner_share) || 0,
//       reference_partner_share_given,

//       provider_partner_share: Number(provider_partner_share) || 0,
//       provider_partner_share_given,

//       fuel_quantity: Number(fuel_quantity) || 0,

//       account_manager,

//       remarks,
//       notes,

//       payment_method,

//       status: "confirmed",
//       updated_by_admin: true,

//     });

//     res.status(201).json(booking);

//   } catch (error) {

//     console.error("Booking Error:", error);

//     res.status(500).json({
//       message: "Server error creating booking",
//     });

//   }
// };


exports.adminCreateBooking = async (req, res) => {
  try {

    const {
      bike_id,
      start_datetime,
      end_datetime,
      customer_id,

      customer_name,
      contact_number,
      customer_email,
      customer_location,

      lead_source,
      source_name,

      vehicle_make_model,
      rental_type,

      deposit_amount,

      reference_partner_share,
      reference_partner_share_given,

      provider_partner_share,
      provider_partner_share_given,

      fuel_quantity,
      account_manager,

      remarks,
      notes,

      payment_method,

      // ✅ NEW FIELDS (added)
      fuel_out_liters,
      fuel_in_liters,
      penalty_amount,
      challan_amount,
      damage_cost

    } = req.body;

    const bike = await Bike.findById(bike_id);

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const start = new Date(start_datetime);
    const end = new Date(end_datetime);

    // ✅ Safety check
    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const totalHours = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60))
    );

    let total_amount = 0;

    const hourlyRate = Number(bike.price_per_hour || 0);
    const dailyRate = Number(bike.price_per_day || 0);

    if (totalHours >= 24 && dailyRate > 0) {

      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      total_amount = days * dailyRate + remainingHours * hourlyRate;

      if (remainingHours * hourlyRate > dailyRate) {
        total_amount = (days + 1) * dailyRate;
      }

    } else {

      total_amount = totalHours * hourlyRate;

    }

    const booking = await Booking.create({

      customer_id,
      bike_id,

      customer_name,
      contact_number,
      customer_email,
      customer_location,

      lead_source,
      source_name,

      vehicle_make_model,
      rental_type,

      start_datetime: start,
      end_datetime: end,

      total_amount,

      // ✅ SAFE NUMBER CONVERSION
      deposit_amount: Number(deposit_amount) || 0,

      reference_partner_share: Number(reference_partner_share) || 0,
      reference_partner_share_given: reference_partner_share_given || false,

      provider_partner_share: Number(provider_partner_share) || 0,
      provider_partner_share_given: provider_partner_share_given || false,

      fuel_quantity: Number(fuel_quantity) || 0,

      // ✅ NEW FIELDS ADDED
      fuel_out_liters: fuel_out_liters !== undefined ? Number(fuel_out_liters) : undefined,
      fuel_in_liters: fuel_in_liters !== undefined ? Number(fuel_in_liters) : undefined,

      penalty_amount: Number(penalty_amount) || 0,
      challan_amount: Number(challan_amount) || 0,
      damage_cost: Number(damage_cost) || 0,


     booking_source: "admin",   // ✅ add this back


      account_manager,

      remarks,
      notes,

      payment_method,

      status: "confirmed",
      updated_by_admin: true,

    });

    res.status(201).json(booking);

  } catch (error) {

    console.error("Booking Error:", error);

    res.status(500).json({
      message: "Server error creating booking",
    });

  }
};




/**
 * GET ALL BOOKINGS (ADMIN)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer_id", "name phone email")
      .populate("bike_id", "model number_plate")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      ...b.toObject(),
      customers: b.customer_id,
      bikes: b.bike_id,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE BOOKING
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer_id", "name phone email")
      .populate("bike_id", "model number_plate");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      ...booking.toObject(),
      customers: booking.customer_id,
      bikes: booking.bike_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE BOOKING (ADMIN CAN EDIT DETAILS)
 */
// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const { start_datetime, end_datetime, total_amount, notes } = req.body;

//     if (start_datetime !== undefined) booking.start_datetime = start_datetime;

//     if (end_datetime !== undefined) booking.end_datetime = end_datetime;

//     if (total_amount !== undefined) booking.total_amount = total_amount;

//     if (notes !== undefined) booking.notes = notes;

//     booking.updated_by_admin = true;

//     await booking.save();

//     res.json({
//       message: "Booking updated successfully",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.updateBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);   // ✅ debug
    console.log("FILE:", req.file);   // ✅ debug

    const body = req.body || {}; // ✅ SAFE FIX

    const updateData = {
      ...body,

      fuel_out_liters:
        body.fuel_out_liters !== undefined
          ? Number(body.fuel_out_liters)
          : undefined,

      fuel_in_liters:
        body.fuel_in_liters !== undefined
          ? Number(body.fuel_in_liters)
          : undefined,

      penalty_amount:
        body.penalty_amount !== undefined
          ? Number(body.penalty_amount)
          : undefined,

      challan_amount:
        body.challan_amount !== undefined
          ? Number(body.challan_amount)
          : undefined,

      damage_cost:
        body.damage_cost !== undefined
          ? Number(body.damage_cost)
          : undefined,
    };

    // ✅ IMAGE SAVE
    if (req.file) {
      updateData.payment_screenshot = req.file.path;
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(200).json(booking);
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// exports.updateBooking = async (req, res) => {
//   try {

//     let updateData = { ...req.body };

//     // ✅ Convert numeric fields safely
//     const numberFields = [
//       "fuel_out_liters",
//       "fuel_in_liters",
//       "penalty_amount",
//       "challan_amount",
//       "damage_cost",
//       "deposit_amount",
//       "reference_partner_share",
//       "provider_partner_share",
//       "fuel_quantity"
//     ];

//     numberFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = Number(req.body[field]);
//       }
//     });

//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: false
//       }
//     );

//     res.status(200).json(booking);

//   } catch (error) {
//     console.error("Update Booking Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



/**
 * UPDATE BOOKING STATUS (FAST ADMIN ACTION)
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updated_by_admin: true },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking status updated",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE / CANCEL BOOKING
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};