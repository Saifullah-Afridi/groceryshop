import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { httpError } from "../../lib/httpError.js";
import { prisma } from "../../lib/prisma.js";
import { safeEqual } from "../../lib/safeEqual.js";

const ADMIN_ID = "primary";

function createSession(email) {
  const user = { email, name: "Admin" };
  const token = jwt.sign({ ...user, role: "admin" }, env.jwtSecret, {
    expiresIn: "7d",
  });
  return { token, user };
}

export async function loginAdmin({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await prisma.adminAccount.findUnique({
    where: { id: ADMIN_ID },
  });

  if (account) {
    const valid =
      normalizedEmail === account.email &&
      (await bcrypt.compare(password, account.passwordHash));
    if (!valid) throw httpError(401, "Wrong email or password.");
    return createSession(account.email);
  }

  // Backward-compatible first login using ADMIN_EMAIL and ADMIN_PASSWORD from .env.
  const valid =
    safeEqual(normalizedEmail, env.adminEmail) &&
    safeEqual(password, env.adminPassword);
  if (!valid) throw httpError(401, "Wrong email or password.");
  return createSession(env.adminEmail);
}

export async function getAdminSettings() {
  const account = await prisma.adminAccount.findUnique({
    where: { id: ADMIN_ID },
  });
  return { email: account?.email ?? env.adminEmail };
}

export async function updateAdminSettings({
  currentPassword,
  email,
  password,
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await prisma.adminAccount.findUnique({
    where: { id: ADMIN_ID },
  });

  let currentPasswordValid = false;
  if (account) {
    currentPasswordValid = await bcrypt.compare(
      currentPassword,
      account.passwordHash,
    );
  } else {
    currentPasswordValid = safeEqual(currentPassword, env.adminPassword);
  }
  if (!currentPasswordValid)
    throw httpError(401, "Your current password is incorrect.");

  const passwordHash = await bcrypt.hash(password, 12);
  const updated = await prisma.adminAccount.upsert({
    where: { id: ADMIN_ID },
    create: { id: ADMIN_ID, email: normalizedEmail, passwordHash },
    update: { email: normalizedEmail, passwordHash },
  });

  return {
    email: updated.email,
    message:
      "Administrator settings updated successfully. Please sign in again with your new credentials.",
  };
}
