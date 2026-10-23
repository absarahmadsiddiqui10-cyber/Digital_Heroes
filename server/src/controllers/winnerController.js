import { Winner } from "../models/index.js";
import { wrap } from "../utils/helpers.js";

// Winner: submit proof URL
export const submitProof = wrap(async (req, res) => {
  const winner = await Winner.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!winner) {
    return res.status(404).json({
      message: "Winner not found.",
    });
  }

  const url = req.body.proofUrl;

  // Correct regular expression for http:// and https:// URLs
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({
      message: "Valid proof URL required.",
    });
  }

  winner.proofUrl = url;
  winner.verificationStatus = "pending";

  await winner.save();

  res.json({ winner });
});
