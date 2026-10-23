import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const SubscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    status: {
      type: String,
      enum: ["inactive", "active", "cancelled", "expired", "pending"],
      default: "inactive",
    },
    amount: Number,
    startedAt: Date,
    renewalDate: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true },
);

export const Subscription =
  models.Subscription || model("Subscription", SubscriptionSchema);
export default Subscription;
