import { Charity, Donation } from "../models/index.js";
import { wrap } from "../utils/helpers.js";

// Create independent donation record
export const createDonation = wrap(async (req, res) => {
  const amount = Number(req.body.amount);

  const charity = await Charity.findOne({
    _id: req.body.charityId,
    active: true,
  });

  if (!charity || amount < 1) {
    return res.status(400).json({
      message: "Valid charity and amount required.",
    });
  }

  const donation = await Donation.create({
    user: req.user._id,
    charity: charity._id,
    amount,
    source: "independent",
    status: "pending",
  });

  res.status(201).json({
    donation,
    message:
      "Donation record created; independent donation checkout is not implemented in this MVP.",
  });
});
