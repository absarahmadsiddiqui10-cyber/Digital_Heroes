import { Charity, Selection } from "../models/index.js";
import { wrap } from "../utils/helpers.js";

// Get active charities
export const getCharities = wrap(async (req, res) => {
  const charities = await Charity.find({ active: true }).sort({
    featured: -1,
    name: 1,
  });

  res.json({ charities });
});

// Update charity selection
export const updateCharitySelection = wrap(async (req, res) => {
  const percentage = Number(req.body.percentage);

  const charity = await Charity.findOne({
    _id: req.body.charityId,
    active: true,
  });

  if (!charity || percentage < 10 || percentage > 100) {
    return res.status(400).json({
      message: "Choose a charity and contribution of 10–100%.",
    });
  }

  const selection = await Selection.findOneAndUpdate(
    { user: req.user._id },
    {
      charity: charity._id,
      percentage,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  ).populate("charity");

  res.json({ selection });
});
