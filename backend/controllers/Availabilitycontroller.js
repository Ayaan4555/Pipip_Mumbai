// const Booking = require("../models/Booking");

// exports.checkAvailability = async (req, res) => {
//   const { bikeId, start_datetime, end_datetime } = req.body;

//   if (!bikeId || !start_datetime || !end_datetime) {
//     return res.status(400).json({
//       isAvailable: false,
//       message: "Missing required fields",
//     });
//   }

//   const start = new Date(start_datetime);
//   const end = new Date(end_datetime);

//   const conflict = await Booking.findOne({
//     bike_id: bikeId,
//     // status: { $ne: "cancelled" },
//       status: { $nin: ["cancelled", "completed"] },
//     start_datetime: { $lt: end },
//     end_datetime: { $gt: start },
//   });

//   if (conflict) {
//     return res.json({
//       isAvailable: false,
//       message: "Bike already booked",
//       bookedFrom: conflict.start_datetime,
//       bookedTo: conflict.end_datetime,
//     });
//   }

//   res.json({
//     isAvailable: true,
//     message: "Bike is available 🎉",
//   });
// };



// const Booking = require("../models/Booking");

// exports.checkAvailability = async (req, res) => {

//   const {
//     bikeId,
//     start_datetime,
//     end_datetime,
//     bookingId // ✅ NEW
//   } = req.body;

//   if (!bikeId || !start_datetime || !end_datetime) {

//     return res.status(400).json({
//       isAvailable: false,
//       message: "Missing required fields",
//     });

//   }

//   const start = new Date(start_datetime);
//   const end = new Date(end_datetime);

//   // Build query

//   const query = {

//     bike_id: bikeId,

//     // Ignore cancelled & completed
//     status: {
//       $nin: ["cancelled", "completed"]
//     },

//     // Overlapping logic
//     start_datetime: { $lt: end },
//     end_datetime: { $gt: start },

//   };

//   // ✅ Ignore same booking during edit

//   if (bookingId) {

//     query._id = {
//       $ne: bookingId
//     };

//   }

//   const conflict =
//     await Booking.findOne(query);

//   if (conflict) {

//     return res.json({

//       isAvailable: false,

//       message: "Bike already booked",

//       bookedFrom:
//         conflict.start_datetime,

//       bookedTo:
//         conflict.end_datetime,

//       bookingId:
//         conflict._id, // useful for frontend

//     });

//   }

//   res.json({

//     isAvailable: true,

//     message: "Bike is available 🎉",

//   });

// };


const Booking = require("../models/Booking");
const mongoose = require("mongoose");

exports.checkAvailability = async (req, res) => {

  const {
    bikeId,
    start_datetime,
    end_datetime,
    bookingId
  } = req.body;

  if (!bikeId || !start_datetime || !end_datetime) {

    return res.status(400).json({
      isAvailable: false,
      message: "Missing required fields",
    });

  }

  const start = new Date(start_datetime);
  const end = new Date(end_datetime);

  const query = {

    bike_id: bikeId,

    status: {
      $nin: ["cancelled", "completed"]
    },

    start_datetime: { $lt: end },
    end_datetime: { $gt: start },

  };

  // ⭐ IMPORTANT FIX

  if (bookingId) {

    query._id = {
      $ne: new mongoose.Types.ObjectId(bookingId)
    };

  }

  const conflict =
    await Booking.findOne(query);

  if (conflict) {

    return res.json({

      isAvailable: false,

      message: "Bike already booked",

      bookedFrom:
        conflict.start_datetime,

      bookedTo:
        conflict.end_datetime,

      bookingId:
        conflict._id,

    });

  }

  res.json({

    isAvailable: true,

    message: "Bike is available 🎉",

  });

};