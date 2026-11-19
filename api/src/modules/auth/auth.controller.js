import { asyncHandler } from "../../lib/asyncHandler.js";
import {
  getAdminSettings,
  loginAdmin,
  updateAdminSettings,
} from "./auth.service.js";
import { loginSchema, updateAdminSettingsSchema } from "./auth.validation.js";

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  res.json(await loginAdmin(input));
});

export const readAdminSettings = asyncHandler(async (_req, res) => {
  res.json(await getAdminSettings());
});

export const saveAdminSettings = asyncHandler(async (req, res) => {
  const input = updateAdminSettingsSchema.parse(req.body);
  res.json(await updateAdminSettings(input));
});
