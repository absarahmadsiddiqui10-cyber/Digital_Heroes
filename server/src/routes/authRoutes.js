import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(authLimiter);
router.post("/register", register);
router.post("/login", login);

export default router;
