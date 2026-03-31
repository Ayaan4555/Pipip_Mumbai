const express = require("express");

const router = express.Router();

const {
  createOrder,
  verifyWebhook,
} = require("../controllers/paymentController");

router.post(
  "/create-order",
  createOrder
);

router.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  verifyWebhook
);

module.exports = router;