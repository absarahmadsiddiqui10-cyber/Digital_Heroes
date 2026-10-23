import { Score } from "../models/index.js";
import { wrap, active } from "../utils/helpers.js";

// Add score
export const addScore = wrap(async (req, res) => {
  if (!(await active(req.user._id))) {
    return res.status(403).json({
      message: "Active membership required to manage scores.",
    });
  }

  const value = Number(req.body.value);
  const date = new Date(`${req.body.date}T00:00:00Z`);

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 45 ||
    !req.body.date ||
    Number.isNaN(date.getTime())
  ) {
    return res.status(400).json({
      message: "Score must be 1–45 with a valid date.",
    });
  }

  const existingScore = await Score.findOne({
    user: req.user._id,
    date,
  });

  if (existingScore) {
    return res.status(409).json({
      message: "A score already exists for this date.",
    });
  }

  const score = await Score.create({
    user: req.user._id,
    value,
    date,
  });

  const allScores = await Score.find({
    user: req.user._id,
  }).sort({ date: -1 });

  if (allScores.length > 5) {
    await Score.deleteMany({
      _id: {
        $in: allScores.slice(5).map((item) => item._id),
      },
    });
  }

  res.status(201).json({ score });
});

// Delete score
export const deleteScore = wrap(async (req, res) => {
  if (!(await active(req.user._id))) {
    return res.status(403).json({
      message: "Active membership required.",
    });
  }

  const score = await Score.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!score) {
    return res.status(404).json({
      message: "Score not found.",
    });
  }

  res.json({ message: "Deleted." });
});
