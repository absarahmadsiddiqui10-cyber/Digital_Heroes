import { Router } from "express";
import { createDonation } from "../controllers/donationController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, createDonation);

export default router;
