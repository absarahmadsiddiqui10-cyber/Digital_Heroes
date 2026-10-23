import { Router } from "express";
import { submitDrawEntry } from "../controllers/drawController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/:drawId/entries", auth, submitDrawEntry);

export default router;
