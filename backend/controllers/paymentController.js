// const {
//   Cashfree,
//   CFEnvironment,
// } = require("cashfree-pg");

// const Booking =
//   require("../models/Booking");

// // Initialize Cashfree

// const cashfree =
//   new Cashfree(
//     process.env.CASHFREE_APP_ID,
//     process.env.CASHFREE_SECRET_KEY,
//     process.env.CASHFREE_ENV ===
//       "production"
//       ? CFEnvironment.PRODUCTION
//       : CFEnvironment.SANDBOX
//   );



// // CREATE ORDER
// exports.createOrder =
//   async (req, res) => {

//     try {

//       const {
//         amount,
//         customerName,
//         customerEmail,
//         customerPhone,
//         bookingId,
//       } = req.body;

//       console.log(
//         "Payment Request:",
//         req.body
//       );

//       const orderId =
//         `bike_${Date.now()}`;

//       const request = {

//         order_amount: amount,
//         order_currency: "INR",
//         order_id: orderId,

//         customer_details: {
//           customer_id: bookingId,
//           customer_name:
//             customerName,
//           customer_email:
//             customerEmail,
//           customer_phone:
//             customerPhone,
//         },

//         order_meta: {
//           return_url:
//             `${process.env.BASE_URL}/payment-success?order_id={order_id}`,
//         },

//       };


//       // ✅ CORRECT METHOD
//       const response =
//         await cashfree.orders.create(
//           request
//         );

//       console.log(
//         "Cashfree Response:",
//         response
//       );

//       // Save orderId in booking
//       await Booking.findByIdAndUpdate(
//         bookingId,
//         {
//           payment_order_id:
//             orderId,
//         }
//       );

//       res.json({
//         success: true,
//         paymentSessionId:
//           response.payment_session_id,
//         orderId,
//       });

//     } catch (error) {

//       console.error(
//         "CREATE ORDER ERROR:",
//         error
//       );

//       res.status(500).json({
//         success: false,
//         message:
//           "Payment order creation failed",
//         error:
//           error.message,
//       });

//     }
//   };

// // WEBHOOK
// exports.verifyWebhook =
//   async (req, res) => {
//     try {
//       const data = req.body.data;

//       const orderId =
//         data.order.order_id;

//       const orderStatus =
//         data.order.order_status;

//       const booking =
//         await Booking.findOne({
//           payment_order_id: orderId,
//         });

//       if (!booking) {
//         return res.status(404).json({
//           message: "Booking not found",
//         });
//       }

//       if (orderStatus === "PAID") {
//         booking.payment_status = "paid";
//         booking.status = "confirmed";
//       } else {
//         booking.payment_status = "failed";
//       }

//       await booking.save();

//       res.status(200).json({
//         success: true,
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         success: false,
//       });
//     }
//   };


const {
  Cashfree,
  CFEnvironment,
} = require("cashfree-pg");

const Booking = require("../models/Booking");


// 🔥 DEBUG LOG
console.log(
  "ENVIRONMENT VALUE:",
  process.env.CASHFREE_ENV
);


// ✅ Correct Initialization

const cashfree = new Cashfree({
  XClientId: process.env.CASHFREE_APP_ID,
  XClientSecret: process.env.CASHFREE_SECRET_KEY,

  XEnvironment:
    process.env.CASHFREE_ENV === "production"
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX,
});


// CREATE ORDER
exports.createOrder =
  async (req, res) => {

    try {

      const {
        amount,
        customerName,
        customerEmail,
        customerPhone,
        bookingId,
      } = req.body;

      console.log(
        "Payment Request:",
        req.body
      );

      const orderId =
        `bike_${Date.now()}`;

      const request = {

        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,

        customer_details: {
          customer_id: bookingId,
          customer_name:
            customerName,
          customer_email:
            customerEmail,
          customer_phone:
            customerPhone,
        },

        order_meta: {
          return_url:
            `${process.env.BASE_URL}/payment-success?order_id={order_id}`,
        },

      };


      // ✅ CORRECT FUNCTION FOR v5
      const response =
        await cashfree.PGCreateOrder(
          request
        );

      console.log(
        "Cashfree Response:",
        response.data
      );


      // Save orderId in DB
      await Booking.findByIdAndUpdate(
        bookingId,
        {
          payment_order_id:
            orderId,
        }
      );


      res.json({
        success: true,
        paymentSessionId:
          response.data
            .payment_session_id,
        orderId,
      });

    } catch (error) {

      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Payment order creation failed",
        error:
          error.message,
      });

    }
  };




// WEBHOOK (your webhook is mostly correct)

exports.verifyWebhook =
  async (req, res) => {

    try {

      const data =
        req.body.data;

      const orderId =
        data.order.order_id;

      const orderStatus =
        data.order.order_status;

      const booking =
        await Booking.findOne({
          payment_order_id:
            orderId,
        });

      if (!booking) {

        return res
          .status(404)
          .json({
            message:
              "Booking not found",
          });

      }


      if (orderStatus === "PAID") {

        booking.payment_status =
          "paid";

        booking.status =
          "confirmed";

      } else {

        booking.payment_status =
          "failed";

      }

      await booking.save();

      res.status(200).json({
        success: true,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
      });

    }
  };