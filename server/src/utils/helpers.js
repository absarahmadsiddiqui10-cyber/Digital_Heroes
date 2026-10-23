import jwt from "jsonwebtoken";
import { Subscription } from "../models/index.js";

export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const pub = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const price = (plan) =>
  Number(
    plan === "yearly"
      ? process.env.YEARLY_PRICE_INR || 4999
      : process.env.MONTHLY_PRICE_INR || 499,
  );

export const renewal = (date, plan) => {
  const nextDate = new Date(date);

  if (plan === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
};

export const active = (userId) =>
  Subscription.findOne({
    user: userId,
    status: "active",
    renewalDate: { $gt: new Date() },
  }).sort({ createdAt: -1 });

export const nums = () => {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers.slice(0, 5).sort((a, b) => a - b);
};
