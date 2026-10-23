import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Charity } from "./models.js";
await mongoose.connect(process.env.MONGODB_URI);
const data = [
  [
    "Fairway Futures Foundation",
    "fairway-futures",
    "Opening access to sport, mentoring and opportunity for young people in underserved communities.",
    "Youth opportunity",
    true,
  ],
  [
    "Clean Water Collective",
    "clean-water-collective",
    "Supporting reliable clean-water access and community-led water infrastructure.",
    "Clean water",
    true,
  ],
  [
    "Green Tomorrow Trust",
    "green-tomorrow",
    "Restoring local habitats through tree planting, biodiversity projects and environmental education.",
    "Environment",
    false,
  ],
  [
    "Open Doors Learning",
    "open-doors-learning",
    "Helping children access learning resources, digital skills and career mentorship.",
    "Education",
    false,
  ],
];
for (const [name, slug, description, category, featured] of data)
  await Charity.updateOne(
    { slug },
    {
      $setOnInsert: {
        name,
        slug,
        description,
        category,
        featured,
        active: true,
      },
    },
    { upsert: true },
  );
console.log("Charities seeded.");
if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  let email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
  if (!(await User.findOne({ email })))
    await User.create({
      name: "Platform Admin",
      email,
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12),
      role: "admin",
    });
  console.log("Admin seed checked:", email);
} else
  console.log("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create admin.");
await mongoose.disconnect();
