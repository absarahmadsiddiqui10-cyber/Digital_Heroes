import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const SelectionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    charity: { type: Schema.Types.ObjectId, ref: "Charity" },
    percentage: { type: Number, min: 10, max: 100, default: 10 },
  },
  { timestamps: true },
);

export const Selection =
  models.Selection || model("Selection", SelectionSchema);
export default Selection;
