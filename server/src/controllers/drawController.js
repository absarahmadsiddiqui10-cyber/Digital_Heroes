import { Draw, DrawEntry } from "../models/index.js";
import { wrap, active } from "../utils/helpers.js";

/* Submit numbers for a published draw */
export const submitDrawEntry = wrap(async (req, res) => {
  // Require active membership.
  if (!(await active(req.user._id))) {
    return res.status(403).json({
      message: "Active membership required to enter a draw.",
    });
  }

  const { drawId } = req.params;
  const numbers = req.body.numbers;

  // Validate exactly five unique integers from 1 to 45.
  if (
    !Array.isArray(numbers) ||
    numbers.length !== 5 ||
    !numbers.every(
      (number) => Number.isInteger(number) && number >= 1 && number <= 45,
    ) ||
    new Set(numbers).size !== 5
  ) {
    return res.status(400).json({
      message: "Choose exactly 5 unique numbers between 1 and 45.",
    });
  }

  const draw = await Draw.findOne({
    _id: drawId,
    status: "published",
  });

  if (!draw) {
    return res.status(404).json({
      message: "Published draw not found.",
    });
  }

  const entry = await DrawEntry.create({
    user: req.user._id,
    draw: draw._id,
    numbers: [...numbers].sort((a, b) => a - b),
  });

  res.status(201).json({
    message: "Draw entry submitted successfully.",
    entry,
  });
});
