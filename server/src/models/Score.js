import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ScoreSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, min: 1, max: 45, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

ScoreSchema.index({ user: 1, date: 1 }, { unique: true });

export const Score = models.Score || model("Score", ScoreSchema);
export default Score;
