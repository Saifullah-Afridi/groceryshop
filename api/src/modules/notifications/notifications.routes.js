import { Router } from "express";
import { requireAdmin, requireCustomer } from "../../middlewares/auth.js";

import {
  listAdmin,
  listMine,
  readAdmin,
  readMine,
  readAllAdmin,
  readAllMine,
} from "./notifications.controller.js";

import { streamNotifications } from "./notifications.stream.js";

const router = Router();

// Admin notifications
router.get("/admin", requireAdmin, listAdmin);
router.get("/admin/stream", requireAdmin, streamNotifications);
router.post("/admin/read-all", requireAdmin, readAllAdmin);
router.post("/admin/:id/read", requireAdmin, readAdmin);

// Customer notifications
router.get("/mine", requireCustomer, listMine);
router.get("/mine/stream", requireCustomer, streamNotifications);
router.post("/mine/read-all", requireCustomer, readAllMine);
router.post("/mine/:id/read", requireCustomer, readMine);

export default router;
