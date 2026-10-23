import {
  User,
  Subscription,
  Donation,
  Score,
  Charity,
  Draw,
  DrawEntry,
  Winner,
} from "../models/index.js";
import { wrap, pub, renewal, nums } from "../utils/helpers.js";

// Admin overview
export const getOverview = wrap(async (req, res) => {
  const totalUsers = await User.countDocuments({
    role: "user",
  });

  const activeSubscriptions = await Subscription.countDocuments({
    status: "active",
    renewalDate: { $gt: new Date() },
  });

  const subscriptions = await Subscription.find({
    status: "active",
  });

  const donations = await Donation.find({
    status: "paid",
  });

  res.json({
    totalUsers,
    activeSubscriptions,

    prizePool: Math.round(
      subscriptions.reduce((total, item) => total + item.amount, 0) *
        Number(process.env.PRIZE_POOL_PERCENT || 0.2),
    ),

    charityContributions: donations.reduce(
      (total, donation) => total + donation.amount,
      0,
    ),
  });
});

// Admin: list users
export const getUsers = wrap(async (req, res) => {
  const users = await User.find().select("-passwordHash");

  const result = await Promise.all(
    users.map(async (user) => ({
      ...pub(user),

      subscriptionStatus:
        (
          await Subscription.findOne({
            user: user._id,
          }).sort({ createdAt: -1 })
        )?.status || "inactive",
    })),
  );

  res.json({ users: result });
});

/* Admin: update user profile */
export const updateUser = wrap(async (req, res) => {
  const { name, email } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({
      message: "Name and email are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.params.id },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email is already in use.",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: name.trim(),
      email: normalizedEmail,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-passwordHash");

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  res.json({
    user: pub(user),
    message: "User profile updated successfully.",
  });
});

/* Admin: list a user's scores */
export const getUserScores = wrap(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  const scores = await Score.find({
    user: user._id,
  }).sort({ date: -1 });

  res.json({ scores });
});

/* Admin: update a user's score */
export const updateUserScore = wrap(async (req, res) => {
  const value = Number(req.body.value);
  const { date } = req.body;

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 45 ||
    !date ||
    Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())
  ) {
    return res.status(400).json({
      message: "Score must be 1-45 with a valid date.",
    });
  }

  const score = await Score.findOne({
    _id: req.params.scoreId,
    user: req.params.id,
  });

  if (!score) {
    return res.status(404).json({
      message: "Score not found for this user.",
    });
  }

  const newDate = new Date(`${date}T00:00:00Z`);

  const duplicate = await Score.findOne({
    user: req.params.id,
    date: newDate,
    _id: { $ne: score._id },
  });

  if (duplicate) {
    return res.status(409).json({
      message: "A score already exists for this date.",
    });
  }

  score.value = value;
  score.date = newDate;

  await score.save();

  res.json({
    score,
    message: "Score updated successfully.",
  });
});

// Admin: update subscription status
export const updateUserSubscription = wrap(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.params.id,
  }).sort({ createdAt: -1 });

  if (!subscription) {
    return res.status(404).json({
      message: "Subscription not found.",
    });
  }

  const status = req.body.status;

  if (!["active", "inactive", "cancelled", "expired"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status.",
    });
  }

  subscription.status = status;

  if (status === "active") {
    subscription.startedAt = new Date();
    subscription.renewalDate = renewal(new Date(), subscription.plan);
  }

  await subscription.save();

  res.json({ subscription });
});

// Admin: list charities
export const getCharities = wrap(async (req, res) => {
  const charities = await Charity.find().sort({
    name: 1,
  });

  res.json({ charities });
});

// Admin: create charity
export const createCharity = wrap(async (req, res) => {
  const { name, description, category = "Community impact" } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      message: "Name and description required.",
    });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const charity = await Charity.create({
    name,
    description,
    category,
    slug,
  });

  res.status(201).json({ charity });
});

// Admin: update charity
export const updateCharity = wrap(async (req, res) => {
  const { name, description, category } = req.body;

  if (!name?.trim() || !description?.trim()) {
    return res.status(400).json({
      message: "Name and description are required.",
    });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const charity = await Charity.findByIdAndUpdate(
    req.params.id,
    {
      name: name.trim(),
      description: description.trim(),
      category: category?.trim() || "Community impact",
      slug,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!charity) {
    return res.status(404).json({
      message: "Charity not found.",
    });
  }

  res.json({ charity });
});

/* Admin: delete charity */
export const deleteCharity = wrap(async (req, res) => {
  const charity = await Charity.findById(req.params.id);

  if (!charity) {
    return res.status(404).json({
      message: "Charity not found.",
    });
  }

  await charity.deleteOne();

  res.json({
    message: "Charity deleted successfully.",
    charityId: charity._id,
  });
});

// Admin: list draws
export const getDraws = wrap(async (req, res) => {
  const draws = await Draw.find().sort({
    drawDate: -1,
  });

  res.json({ draws });
});

/* Admin: simulate or publish draw */
export const runDraw = wrap(async (req, res) => {
  const {
    title = "Monthly draw",
    drawDate,
    mode = "random",
    simulate = false,
  } = req.body;

  if (!drawDate) {
    return res.status(400).json({
      message: "Draw date required.",
    });
  }

  if (!["random", "weighted"].includes(mode)) {
    return res.status(400).json({
      message: "Invalid draw mode.",
    });
  }

  const weightedNums = async () => {
    const scores = await Score.find();

    const frequency = new Map();

    for (let i = 1; i <= 45; i++) {
      frequency.set(i, 1);
    }

    for (const score of scores) {
      frequency.set(score.value, (frequency.get(score.value) || 1) + 1);
    }

    const pool = [];

    for (const [number, weight] of frequency) {
      for (let i = 0; i < weight; i++) {
        pool.push(number);
      }
    }

    const selected = [];

    while (selected.length < 5) {
      const index = Math.floor(Math.random() * pool.length);
      const number = pool[index];

      if (!selected.includes(number)) {
        selected.push(number);
      }
    }

    return selected.sort((a, b) => a - b);
  };

  const numbers = mode === "weighted" ? await weightedNums() : nums();

  const subscriptions = await Subscription.find({
    status: "active",
    renewalDate: { $gt: new Date() },
  });

  const basePrizePool = Math.round(
    subscriptions.reduce((total, item) => total + (item.amount || 0), 0) *
      Number(process.env.PRIZE_POOL_PERCENT || 0.2),
  );

  // Collect unclaimed jackpots from completed draws.
  const previousDraws = await Draw.find({
    status: "completed",
    unclaimedJackpot: { $gt: 0 },
  });

  const jackpotRollover = previousDraws.reduce(
    (total, previousDraw) =>
      total + Number(previousDraw.unclaimedJackpot || 0),
    0,
  );

  const prizePool = basePrizePool + jackpotRollover;

  const prizeTiers = {
    match3: Math.round(basePrizePool * 0.25),
    match4: Math.round(basePrizePool * 0.35),
    match5: Math.round(basePrizePool * 0.4) + jackpotRollover,
  };

  if (simulate) {
    return res.json({
      simulated: true,
      numbers,
      basePrizePool,
      jackpotRollover,
      prizePool,
      prizeTiers,
    });
  }

  const draw = await Draw.create({
    title,
    drawDate: new Date(drawDate),
    mode,
    status: "published",
    numbers,
    prizePool,
    prizeTiers,
    jackpotRollover,
    participantCount: await DrawEntry.countDocuments({
      draw: { $exists: true },
    }),
    createdBy: req.user._id,
  });

  // Mark previous jackpots as consumed after creating this draw.
  if (jackpotRollover > 0) {
    await Draw.updateMany(
      {
        _id: { $in: previousDraws.map((draw) => draw._id) },
        status: "completed",
        unclaimedJackpot: { $gt: 0 },
      },
      {
        $set: { unclaimedJackpot: 0 },
      },
    );
  }

  res.status(201).json({
    draw,
    numbers,
    basePrizePool,
    jackpotRollover,
    prizePool,
    prizeTiers,
  });
});

/* Admin: mark a published draw as completed and calculate winners */
export const completeDraw = wrap(async (req, res) => {
  const draw = await Draw.findOne({
    _id: req.params.id,
    status: "published",
  });

  if (!draw) {
    return res.status(404).json({
      message: "Published draw not found.",
    });
  }

  // Prevent duplicate winner creation.
  const existingWinners = await Winner.countDocuments({
    draw: draw._id,
  });

  if (existingWinners > 0) {
    return res.status(409).json({
      message: "Winners have already been generated for this draw.",
    });
  }

  const entries = await DrawEntry.find({
    draw: draw._id,
  });

  const tiers = {
    3: [],
    4: [],
    5: [],
  };

  const winningNumbers = new Set(draw.numbers);

  for (const entry of entries) {
    const matches = entry.numbers.filter((number) =>
      winningNumbers.has(number),
    ).length;

    if (matches >= 3) {
      tiers[matches].push(entry);
    }
  }

  const tierAmounts = {
    3: Number(draw.prizeTiers?.match3 || 0),
    4: Number(draw.prizeTiers?.match4 || 0),
    5: Number(draw.prizeTiers?.match5 || 0),
  };

  const winnersToCreate = [];

  for (const tier of [3, 4, 5]) {
    const tierEntries = tiers[tier];

    if (tierEntries.length === 0) {
      continue;
    }

    const totalPrize = tierAmounts[tier];
    const share = Math.floor((totalPrize * 100) / tierEntries.length) / 100;
    let remainingPaise =
      Math.round(totalPrize * 100) -
      Math.round(share * 100) * tierEntries.length;

    for (const entry of tierEntries) {
      const extraPaise = remainingPaise > 0 ? 1 : 0;
      remainingPaise -= extraPaise;

      winnersToCreate.push({
        user: entry.user,
        draw: draw._id,
        matchTier: tier,
        prizeAmount: share + extraPaise / 100,
        verificationStatus: "pending",
        payoutStatus: "pending",
      });
    }
  }

  if (winnersToCreate.length > 0) {
    await Winner.insertMany(winnersToCreate);
  }

  // Carry forward the 5-match prize only when there are no 5-match winners.
  if (tiers[5].length === 0) {
    draw.unclaimedJackpot = Number(draw.prizeTiers?.match5 || 0);
  } else {
    draw.unclaimedJackpot = 0;
  }

  draw.status = "completed";
  await draw.save();

  res.json({
    message: "Draw completed and winner matching finished.",
    draw,
    entriesChecked: entries.length,
    winnersCreated: winnersToCreate.length,
    matchingCounts: {
      match3: tiers[3].length,
      match4: tiers[4].length,
      match5: tiers[5].length,
    },
  });
});

// Admin: list winners
export const getWinners = wrap(async (req, res) => {
  const winners = await Winner.find()
    .populate("user", "name email")
    .populate("draw", "title drawDate")
    .sort({ createdAt: -1 });

  res.json({ winners });
});

// Admin: update winner verification
export const updateWinnerStatus = wrap(async (req, res) => {
  const status = req.body.verificationStatus;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Invalid verification status.",
    });
  }

  const winner = await Winner.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: status },
    { new: true },
  );

  if (!winner) {
    return res.status(404).json({
      message: "Winner not found.",
    });
  }

  res.json({ winner });
});

// Admin: mark approved winner payout as paid
export const payoutWinner = wrap(async (req, res) => {
  const winner = await Winner.findById(req.params.id);

  if (!winner) {
    return res.status(404).json({
      message: "Winner not found.",
    });
  }

  if (winner.verificationStatus !== "approved") {
    return res.status(400).json({
      message: "Approve winner first.",
    });
  }

  winner.payoutStatus = "paid";
  winner.paidAt = new Date();

  await winner.save();

  res.json({ winner });
});

// Admin reports
export const getReports = wrap(async (req, res) => {
  const [users, subscriptions, donations, draws, winners] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Subscription.find(),
    Donation.find({ status: "paid" }).populate("charity", "name"),
    Draw.countDocuments({ status: "published" }),
    Winner.countDocuments(),
  ]);

  const donationTotals = {};

  donations.forEach((donation) => {
    const charityName = donation.charity?.name || "Unknown";

    donationTotals[charityName] =
      (donationTotals[charityName] || 0) + donation.amount;
  });

  res.json({
    users,

    subscriptionRevenue: subscriptions
      .filter((subscription) => subscription.status === "active")
      .reduce((total, subscription) => total + subscription.amount, 0),

    donationTotals,
    draws,
    winners,
  });
});
