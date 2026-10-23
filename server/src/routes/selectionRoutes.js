import { Router } from "express";
import { updateCharitySelection } from "../controllers/charityController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.put("/", auth, updateCharitySelection);

export default router;
