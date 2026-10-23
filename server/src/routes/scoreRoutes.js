import { Router } from "express";
import { addScore, deleteScore } from "../controllers/scoreController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);
router.post("/", addScore);
router.delete("/:id", deleteScore);

export default router;
