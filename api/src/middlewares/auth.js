import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { httpError } from "../lib/httpError.js";

// Builds a guard for one role. Admin and customer tokens are not interchangeable.
const requireRole = (role) => (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(httpError(401, "Please sign in."));

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(
      httpError(401, "Your session has expired. Please sign in again."),
    );
  }
  if (payload.role !== role)
    return next(httpError(403, "You do not have access to this."));

  req.auth = payload;
  next();
};

export const requireAdmin = requireRole("admin");
export const requireCustomer = requireRole("customer");
