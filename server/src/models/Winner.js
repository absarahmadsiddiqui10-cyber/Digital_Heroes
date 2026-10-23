import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const WinnerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    draw: { type: Schema.Types.ObjectId, ref: "Draw" },
    matchTier: { type: Number, enum: [3, 4, 5] },
    prizeAmount: Number,
    proofUrl: String,
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: Date,
  },
  { timestamps: true },
);

export const Winner = models.Winner || model("Winner", WinnerSchema);
export default Winner;
