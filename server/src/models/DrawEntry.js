import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const DrawEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    draw: {
      type: Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },
    numbers: {
      type: [{ type: Number, min: 1, max: 45 }],
      required: true,
      validate: {
        validator: (numbers) =>
          Array.isArray(numbers) &&
          numbers.length === 5 &&
          numbers.every(
            (number) => Number.isInteger(number) && number >= 1 && number <= 45,
          ) &&
          new Set(numbers).size === 5,
        message: "Choose exactly 5 unique numbers between 1 and 45.",
      },
    },
  },
  { timestamps: true },
);

// One entry per user per draw.
DrawEntrySchema.index({ user: 1, draw: 1 }, { unique: true });

export const DrawEntry =
  models.DrawEntry || model("DrawEntry", DrawEntrySchema);
export default DrawEntry;
