import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.js";
import { databaseRateLimit } from "../../middlewares/databaseRateLimit.js";
import { login, readAdminSettings, saveAdminSettings } from "./auth.controller.js";

const loginLimiter = databaseRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  namespace: "admin:login",
  message: "Too many attempts. Try again in a few minutes.",
});

const router = Router();
router.post("/login", loginLimiter, login);
router.get("/settings", requireAdmin, readAdminSettings);
router.put("/settings", requireAdmin, saveAdminSettings);

export default router;
