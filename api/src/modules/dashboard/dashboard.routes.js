import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.js";
import { getDashboard } from "./dashboard.service.js";
const router = Router();
router.get("/", requireAdmin, async (_req, res, next) => {
  try { res.json(await getDashboard()); } catch (error) { next(error); }
});
export default router;
