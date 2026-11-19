import { Router } from "express";
import { databaseRateLimit } from "../../middlewares/databaseRateLimit.js";
import { submitContact } from "./contact.controller.js";

const contactLimiter = databaseRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  namespace: "contact:submit",
  message: "Too many messages. Please try again later.",
});

const router = Router();
router.post("/", contactLimiter, submitContact);
export default router;
