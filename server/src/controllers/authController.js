import bcrypt from "bcryptjs";
import { User, Charity, Selection, Subscription } from "../models/index.js";
import { wrap, sign, pub, price } from "../utils/helpers.js";

export const register = wrap(async (req, res) => {
  let {
    name,
    email,
    password,
    plan = "monthly",
    charityId,
    percentage = 10,
  } = req.body;

  if (!name?.trim() || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters.",
    });
  }

  if (
    !["monthly", "yearly"].includes(plan) ||
    Number(percentage) < 10 ||
    Number(percentage) > 100
  ) {
    return res.status(400).json({
      message: "Invalid plan or charity percentage.",
    });
  }

  email = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered.",
    });
  }

  if (
    charityId &&
    !(await Charity.findOne({
      _id: charityId,
      active: true,
    }))
  ) {
    return res.status(400).json({
      message: "Invalid charity.",
    });
  }

  const user = await User.create({
    name: name.trim(),
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });

  if (charityId) {
    await Selection.create({
      user: user._id,
      charity: charityId,
      percentage: Number(percentage),
    });
  }

  const subscription = await Subscription.create({
    user: user._id,
    plan,
    status: "inactive",
    amount: price(plan),
  });

  res.status(201).json({
    token: sign(user),
    user: pub(user),
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
    },
  });
});

export const login = wrap(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: (email || "").toLowerCase().trim(),
  });

  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  res.json({
    token: sign(user),
    user: pub(user),
  });
});
