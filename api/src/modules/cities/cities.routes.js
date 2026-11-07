import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.js";
import { create, listActive, listAll, remove, update } from "./cities.controller.js";

const router = Router();

router.get("/", listActive); // shoppers: active cities and fees
router.get("/all", requireAdmin, listAll); // admin: every city
router.post("/", requireAdmin, create);
router.put("/:id", requireAdmin, update);
router.delete("/:id", requireAdmin, remove);

export default router;
