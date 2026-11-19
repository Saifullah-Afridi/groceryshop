import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { httpError } from "../../lib/httpError.js";
import { safeEqual } from "../../lib/safeEqual.js";

// For now there is one admin, set in .env. LATER: look the admin up in the database with a hashed password.
export function loginAdmin({ email, password }) {
  const valid = safeEqual(email.toLowerCase(), env.adminEmail) && safeEqual(password, env.adminPassword);
  if (!valid) throw httpError(401, "Wrong email or password.");

  const user = { email: env.adminEmail, name: "Admin" };
  const token = jwt.sign({ ...user, role: "admin" }, env.jwtSecret, { expiresIn: "7d" });
  return { token, user };
}
