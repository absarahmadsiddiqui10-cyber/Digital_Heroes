import { Router } from "express";
import { submitProof } from "../controllers/winnerController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/:id/proof", auth, submitProof);

export default router;
