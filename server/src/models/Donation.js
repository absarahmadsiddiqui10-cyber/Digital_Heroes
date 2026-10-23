import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const DonationSchema = new Schema(
  {
    user: Schema.Types.ObjectId,
    charity: { type: Schema.Types.ObjectId, ref: "Charity" },
    amount: Number,
    source: { type: String, enum: ["subscription", "independent"] },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: String,
  },
  { timestamps: true },
);

export const Donation = models.Donation || model("Donation", DonationSchema);
export default Donation;
