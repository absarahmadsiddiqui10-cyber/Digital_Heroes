import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const PaymentSchema = new Schema(
  {
    user: Schema.Types.ObjectId,
    subscription: Schema.Types.ObjectId,
    plan: String,
    amount: Number,
    orderId: { type: String, unique: true, sparse: true },
    paymentId: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["created", "verified", "failed"],
      default: "created",
    },
    signatureVerified: Boolean,
  },
  { timestamps: true },
);

export const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;
