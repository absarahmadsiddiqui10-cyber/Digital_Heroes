import { Router } from "express";
import { getCharities } from "../controllers/charityController.js";

const router = Router();

router.get("/", getCharities);

export default router;
