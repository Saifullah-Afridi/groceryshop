import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "./contact.controller.js";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again later." },
});

const router = Router();
router.post("/", contactLimiter, submitContact);
export default router;
