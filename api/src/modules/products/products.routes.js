import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.js";
import { parseImage } from "../../middlewares/parseImage.js";
import { adminList, create, getOne, list, remove, restore, suggestions, update } from "./products.controller.js";

const router = Router();

// Anyone can read. Only the admin can change.
router.get("/", list);
router.get("/admin/all", requireAdmin, adminList);
router.get("/search/suggestions", suggestions);
router.get("/:id", getOne);
router.post("/", requireAdmin, parseImage, create);
router.put("/:id", requireAdmin, parseImage, update);
router.delete("/:id", requireAdmin, remove); // legacy clients archive rather than permanently delete
router.post("/:id/archive", requireAdmin, remove);
router.post("/:id/restore", requireAdmin, restore);

export default router;
