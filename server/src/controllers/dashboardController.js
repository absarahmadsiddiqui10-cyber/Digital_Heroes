import {
  Score,
  Subscription,
  Selection,
  Draw,
  Winner,
  Donation,
  DrawEntry,
} from "../models/index.js";
import { wrap, active, pub } from "../utils/helpers.js";

// Dashboard
export const getDashboard = wrap(async (req, res) => {
  const [
    subscription,
    scores,
    selection,
    draws,
    winners,
    donations,
    drawEntries,
  ] = await Promise.all([
    active(req.user._id),
    Score.find({ user: req.user._id }).sort({ date: -1 }).limit(5),
    Selection.findOne({ user: req.user._id }).populate("charity"),
    Draw.find({
      status: { $in: ["published", "completed"] },
    })
      .sort({ drawDate: -1 })
      .limit(5),
    Winner.find({ user: req.user._id }),
    Donation.find({
      user: req.user._id,
      status: "paid",
    }),
    DrawEntry.find({ user: req.user._id }).populate(
      "draw",
      "title drawDate numbers status",
    ),
  ]);

  const lastSubscription =
    subscription ||
    (await Subscription.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 }));

  res.json({
    user: pub(req.user),

    subscription: lastSubscription
      ? {
          plan: lastSubscription.plan,
          status: subscription ? "active" : lastSubscription.status,
          amount: lastSubscription.amount,
          renewalDate: lastSubscription.renewalDate,
        }
      : null,

    scores,

    charitySelection: selection
      ? {
          charityId: selection.charity?._id,
          percentage: selection.percentage,
          charity: selection.charity,
        }
      : null,

    draws,
    drawEntries,
    drawsEntered: drawEntries.length,
    winners,

    totalWinnings: winners
      .filter((winner) => winner.payoutStatus === "paid")
      .reduce((total, winner) => total + (winner.prizeAmount || 0), 0),

    donations,
  });
});
