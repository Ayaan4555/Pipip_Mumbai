
const {
  Cashfree,
  CFEnvironment,
  OrdersApi,
} = require("cashfree-pg");

const Booking =
  require("../models/Booking");

// Setup Cashfree

Cashfree.XClientId =
  process.env.CASHFREE_APP_ID;

Cashfree.XClientSecret =
  process.env.CASHFREE_SECRET_KEY;

Cashfree.XEnvironment =
  process.env.CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;


// Create Order API
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

      // NEW SDK CALL
      const response =
        await OrdersApi.createOrder(
          request
        );

      console.log(
        "Cashfree Response:",
        response.data
      );

      // Save order ID
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

// WEBHOOK
exports.verifyWebhook =
  async (req, res) => {
    try {
      const data = req.body.data;

      const orderId =
        data.order.order_id;

      const orderStatus =
        data.order.order_status;

      const booking =
        await Booking.findOne({
          payment_order_id: orderId,
        });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      if (orderStatus === "PAID") {
        booking.payment_status = "paid";
        booking.status = "confirmed";
      } else {
        booking.payment_status = "failed";
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