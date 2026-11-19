import { Router } from "express";
import { databaseRateLimit } from "../../middlewares/databaseRateLimit.js";
import { requireAdmin, requireCustomer } from "../../middlewares/auth.js";
import { adminCreate, adminGetOne, adminUpdate, list, login, me, register, remove, resend, verify } from "./customers.controller.js";

// Slows down guessing of passwords and codes.
const limiter = databaseRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  namespace: "customers:auth",
  message: "Too many attempts. Try again in a few minutes.",
});

const router = Router();

// Shopper
router.post("/register", limiter, register);
router.post("/verify-otp", limiter, verify);
router.post("/resend-otp", limiter, resend);
router.post("/login", limiter, login);
router.get("/me", requireCustomer, me);

// Admin
router.get("/", requireAdmin, list);
router.get("/:id", requireAdmin, adminGetOne);
router.post("/", requireAdmin, adminCreate);
router.put("/:id", requireAdmin, adminUpdate);
router.delete("/:id", requireAdmin, remove);

export default router;
