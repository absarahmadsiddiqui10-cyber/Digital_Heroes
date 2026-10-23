import { Router } from "express";
import authRoutes from "./authRoutes.js";
import charityRoutes from "./charityRoutes.js";
import selectionRoutes from "./selectionRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import scoreRoutes from "./scoreRoutes.js";
import drawRoutes from "./drawRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import donationRoutes from "./donationRoutes.js";
import winnerRoutes from "./winnerRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Route modules
router.use("/auth", authRoutes);
router.use("/charities", charityRoutes);
router.use("/charity-selection", selectionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/scores", scoreRoutes);
router.use("/draws", drawRoutes);
router.use("/payments", paymentRoutes);
router.use("/donations", donationRoutes);
router.use("/winners", winnerRoutes);
router.use("/admin", adminRoutes);

export default router;
