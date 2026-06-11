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

// const Booking = require("../models/Booking");
// const mongoose = require("mongoose");

// exports.checkAvailability = async (req, res) => {

//   const {
//     bikeId,
//     clusterId,
//     start_datetime,
//     end_datetime,
//     bookingId
//   } = req.body;

//   if (!bikeId || !start_datetime || !end_datetime) {

//     return res.status(400).json({
//       isAvailable: false,
//       message: "Missing required fields",
//     });

//   }

//   const start = new Date(start_datetime);
//   const end = new Date(end_datetime);

//   const query = {

//     bike_id: bikeId,

//     status: {
//       $nin: ["cancelled", "completed"]
//     },

//     start_datetime: { $lt: end },
//     end_datetime: { $gt: start },

//   };

//   // ⭐ IMPORTANT FIX

//   if (bookingId) {

//     query._id = {
//       $ne: new mongoose.Types.ObjectId(bookingId)
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
//         conflict._id,

//     });

//   }

//   res.json({

//     isAvailable: true,

//     message: "Bike is available 🎉",

//   });

// };

const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const Cluster = require("../models/Cluster");
const Bike = require("../models/Bike");

exports.checkAvailability = async (req, res) => {
  const { bikeId, clusterId, start_datetime, end_datetime, bookingId } =
    req.body;

  // Must have either bikeId OR clusterId
  if ((!bikeId && !clusterId) || !start_datetime || !end_datetime) {
    return res.status(400).json({
      isAvailable: false,
      message: "Missing required fields",
    });
  }

  const start = new Date(start_datetime);
  const end = new Date(end_datetime);

  try {
    // ===============================
    // CLUSTER AVAILABILITY CHECK
    // ===============================

    if (clusterId) {
      const cluster = await Cluster.findById(clusterId).populate("bikes");

      if (!cluster) {
        return res.status(404).json({
          isAvailable: false,
          message: "Cluster not found",
        });
      }

      const bikeIds = cluster.bikes.map((b) => b._id);

      const query = {
        status: {
          $nin: ["cancelled", "completed"],
        },

        start_datetime: {
          $lt: end,
        },

        end_datetime: {
          $gt: start,
        },

        $or: [{ cluster_id: clusterId }, { bike_id: { $in: bikeIds } }],
      };

      // Ignore current booking during edit
      if (bookingId) {
        query._id = {
          $ne: new mongoose.Types.ObjectId(bookingId),
        };
      }

      const conflicts = await Booking.find(query);

      if (conflicts.length >= cluster.bikes.length) {
        return res.json({
          isAvailable: false,

          message: "No bikes available in this cluster for this slot",

          bookedFrom: conflicts[0]?.start_datetime,

          bookedTo: conflicts[0]?.end_datetime,
        });
      }

      return res.json({
        isAvailable: true,

        message: "Bikes are available in this cluster 🎉",
      });
    }

    // ===============================
    // SINGLE BIKE AVAILABILITY CHECK
    // ===============================

    const query = {
      bike_id: bikeId,

      status: {
        $nin: ["cancelled", "completed"],
      },

      start_datetime: {
        $lt: end,
      },

      end_datetime: {
        $gt: start,
      },
    };

    // Ignore current booking during edit
    if (bookingId) {
      query._id = {
        $ne: new mongoose.Types.ObjectId(bookingId),
      };
    }

    const conflict = await Booking.findOne(query);

    if (conflict) {
      return res.json({
        isAvailable: false,

        message: "Bike already booked",

        bookedFrom: conflict.start_datetime,

        bookedTo: conflict.end_datetime,

        bookingId: conflict._id,
      });
    }

    return res.json({
      isAvailable: true,

      message: "Bike is available 🎉",
    });
  } catch (err) {
    console.error("Availability Error:", err);

    return res.status(500).json({
      isAvailable: false,

      message: err.message,
    });
  }
};
