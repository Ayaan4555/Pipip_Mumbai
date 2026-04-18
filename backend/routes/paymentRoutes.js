const express = require("express");

const router = express.Router();

const {
  createOrder,
  verifyWebhook,
  verifyPayment
} = require("../controllers/paymentController");

router.post(
  "/create-order",
  createOrder
);

router.post(
  "/webhook",
 
  verifyWebhook
);

router.get("/verify/:orderId", verifyPayment);

module.exports = router;