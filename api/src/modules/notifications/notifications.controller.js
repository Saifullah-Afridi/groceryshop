import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { httpError } from "../../lib/httpError.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.service.js";
const readId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    throw httpError(400, "Invalid notification id.");
  return id;
};
export const listAdmin = asyncHandler(async (_req, res) =>
  res.json(await listNotifications("ADMIN")),
);
export const listMine = asyncHandler(async (req, res) =>
  res.json(await listNotifications("CUSTOMER", Number(req.auth.sub))),
);
export const readAdmin = asyncHandler(async (req, res) =>
  res.json(await markNotificationRead(readId(req), "ADMIN")),
);
export const readMine = asyncHandler(async (req, res) =>
  res.json(
    await markNotificationRead(readId(req), "CUSTOMER", Number(req.auth.sub)),
  ),
);
export const readAllAdmin = asyncHandler(async (_req, res) =>
  res.json(await markAllNotificationsRead("ADMIN")),
);
export const readAllMine = asyncHandler(async (req, res) =>
  res.json(await markAllNotificationsRead("CUSTOMER", Number(req.auth.sub))),
);

// Supabase Realtime verifies this short-lived token using the project's JWT signing secret.
// The application JWT is never sent to Supabase, and the Supabase secret stays on the API.
export const realtimeToken = asyncHandler(async (req, res) => {
  if (!env.supabaseJwtSecret)
    throw httpError(
      503,
      "Realtime is not configured. Add SUPABASE_JWT_SECRET to the API environment.",
    );
  const isAdmin = req.auth.role === "admin";
  const subject = isAdmin
    ? "00000000-0000-4000-8000-000000000001"
    : `00000000-0000-4000-8000-${String(req.auth.sub).padStart(12, "0")}`;
  const token = jwt.sign(
    {
      aud: "authenticated",
      role: "authenticated",
      app_metadata: isAdmin
        ? { rakan_role: "admin" }
        : { rakan_role: "customer", rakan_customer_id: String(req.auth.sub) },
    },
    env.supabaseJwtSecret,
    { algorithm: "HS256", subject, issuer: "supabase", expiresIn: "5m" },
  );
  res.json({ token, expiresIn: 300 });
});
