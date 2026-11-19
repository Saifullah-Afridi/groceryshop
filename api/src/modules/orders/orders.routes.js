import { Router } from "express";
import { databaseRateLimit } from "../../middlewares/databaseRateLimit.js";
import { requireAdmin, requireCustomer } from "../../middlewares/auth.js";
import { cancel, create, getOne, listAll, listMine, updateStatus } from "./orders.controller.js";

const placeOrderLimiter = databaseRateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  namespace: "orders:create",
  message: "Too many orders. Please try again later.",
});

const router = Router();

// Shopper
router.post("/", requireCustomer, placeOrderLimiter, create);
router.get("/mine", requireCustomer, listMine);
router.post("/:id/cancel", requireCustomer, cancel);

// Admin
router.get("/", requireAdmin, listAll);
router.get("/:id", requireAdmin, getOne);
router.put("/:id/status", requireAdmin, updateStatus);

export default router;
