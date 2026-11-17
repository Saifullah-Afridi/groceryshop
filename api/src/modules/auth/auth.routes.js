import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../../middlewares/auth.js";
import { getSettings, login, updateSettings } from "./auth.controller.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});
const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.post("/login", loginLimiter, login);
router.get("/settings", requireAdmin, getSettings);
router.put("/settings", requireAdmin, settingsLimiter, updateSettings);

export default router;
