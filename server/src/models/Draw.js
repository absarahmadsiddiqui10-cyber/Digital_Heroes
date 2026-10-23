import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const DrawSchema = new Schema(
  {
    title: String,
    drawDate: Date,
    mode: {
      type: String,
      enum: ["random", "weighted"],
      default: "random",
    },
    status: {
      type: String,
      enum: ["simulated", "published", "completed"],
      default: "simulated",
    },
    numbers: [Number],
    prizePool: Number,
    prizeTiers: {
      match3: Number,
      match4: Number,
      match5: Number,
    },
    jackpotRollover: {
      type: Number,
      default: 0,
      min: 0,
    },
    unclaimedJackpot: {
      type: Number,
      default: 0,
      min: 0,
    },
    participantCount: Number,
    createdBy: Schema.Types.ObjectId,
  },
  { timestamps: true },
);

export const Draw = models.Draw || model("Draw", DrawSchema);
export default Draw;
