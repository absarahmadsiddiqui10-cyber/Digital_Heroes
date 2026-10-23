import { Router } from "express";
import {
  getOverview,
  getUsers,
  updateUser,
  getUserScores,
  updateUserScore,
  updateUserSubscription,
  getCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  getDraws,
  runDraw,
  completeDraw,
  getWinners,
  updateWinnerStatus,
  payoutWinner,
  getReports,
} from "../controllers/adminController.js";
import { auth, admin } from "../middleware/auth.js";

const router = Router();

// Protect all admin routes with auth and admin middlewares
router.use(auth, admin);

// Overview & Reports
router.get("/overview", getOverview);
router.get("/reports", getReports);

// Users management
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.get("/users/:id/scores", getUserScores);
router.patch("/users/:id/scores/:scoreId", updateUserScore);
router.patch("/users/:id/subscription", updateUserSubscription);

// Charities management
router.get("/charities", getCharities);
router.post("/charities", createCharity);
router.patch("/charities/:id", updateCharity);
router.delete("/charities/:id", deleteCharity);

// Draws management
router.get("/draws", getDraws);
router.post("/draws/run", runDraw);
router.patch("/draws/:id/complete", completeDraw);

// Winners management
router.get("/winners", getWinners);
router.patch("/winners/:id", updateWinnerStatus);
router.patch("/winners/:id/payout", payoutWinner);

export default router;
