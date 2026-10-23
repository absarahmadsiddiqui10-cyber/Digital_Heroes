import crypto from "crypto";
import Razorpay from "razorpay";
import {
  Subscription,
  Payment,
  Selection,
  Donation,
} from "../models/index.js";
import { wrap, price, renewal } from "../utils/helpers.js";

// Create Razorpay order
export const createOrder = wrap(async (req, res) => {
  const plan = req.body.plan || "monthly";

  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({
      message: "Invalid plan.",
    });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      message: "Configure Razorpay Test Mode keys in server/.env.",
    });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const amount = price(plan);

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `dh_${req.user._id}_${Date.now()}`,
    notes: {
      userId: String(req.user._id),
      plan,
    },
  });

  const subscription = await Subscription.findOneAndUpdate(
    {
      user: req.user._id,
      status: {
        $in: ["inactive", "expired", "cancelled", "pending"],
      },
    },
    {
      user: req.user._id,
      plan,
      status: "pending",
      amount,
      razorpayOrderId: order.id,
    },
    {
      new: true,
      upsert: true,
    },
  );

  await Payment.create({
    user: req.user._id,
    subscription: subscription._id,
    plan,
    amount,
    orderId: order.id,
    status: "created",
  });

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan,
  });
});

// Verify Razorpay payment
export const verifyPayment = wrap(async (req, res) => {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      message: "Missing payment verification fields.",
    });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return res.status(400).json({
      message: "Signature verification failed.",
    });
  }

  const payment = await Payment.findOne({
    orderId,
    user: req.user._id,
  });

  if (!payment) {
    return res.status(404).json({
      message: "Order not found.",
    });
  }

  if (payment.status === "verified") {
    return res.json({
      message: "Already verified.",
      status: "active",
    });
  }

  const subscription = await Subscription.findById(payment.subscription);

  if (!subscription) {
    return res.status(404).json({
      message: "Subscription not found.",
    });
  }

  subscription.status = "active";
  subscription.startedAt = new Date();
  subscription.renewalDate = renewal(new Date(), payment.plan);
  subscription.razorpayOrderId = orderId;
  subscription.razorpayPaymentId = paymentId;

  await subscription.save();

  payment.status = "verified";
  payment.signatureVerified = true;
  payment.paymentId = paymentId;

  await payment.save();

  const selection = await Selection.findOne({
    user: req.user._id,
  });

  if (selection) {
    await Donation.create({
      user: req.user._id,
      charity: selection.charity,
      amount: Math.round((payment.amount * selection.percentage) / 100),
      source: "subscription",
      status: "paid",
      paymentId,
    });
  }

  res.json({
    message: "Payment verified; membership active.",
    status: "active",
    renewalDate: subscription.renewalDate,
  });
});
