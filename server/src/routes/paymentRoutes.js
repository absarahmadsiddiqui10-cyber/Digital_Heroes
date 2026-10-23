import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);

export default router;
