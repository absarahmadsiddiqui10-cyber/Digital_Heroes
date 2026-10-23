import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { wrap } from "../utils/helpers.js";

export const auth = wrap(async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");

    if (!token) {
      throw new Error("Missing token");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(payload.id).select("-passwordHash");

    if (!req.user?.isActive) {
      throw new Error("Inactive user");
    }

    next();
  } catch {
    return res.status(401).json({
      message: "Please log in again.",
    });
  }
});

export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Administrator access required.",
  });
};
