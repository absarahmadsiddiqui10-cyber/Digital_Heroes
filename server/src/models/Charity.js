import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const CharitySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    category: { type: String, default: "Community impact" },
    featured: Boolean,
    active: { type: Boolean, default: true },
    upcomingEvents: [{ title: String, date: String, location: String }],
  },
  { timestamps: true },
);

export const Charity = models.Charity || model("Charity", CharitySchema);
export default Charity;
