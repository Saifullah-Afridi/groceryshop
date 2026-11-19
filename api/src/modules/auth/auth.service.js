import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { httpError } from "../../lib/httpError.js";
import { safeEqual } from "../../lib/safeEqual.js";
import { prisma } from "../../lib/prisma.js";

const ADMIN_ID = "primary";
const PASSWORD_ROUNDS = 12;

async function findAdminAccount() {
  return prisma.adminAccount.findUnique({ where: { id: ADMIN_ID } });
}

// Existing deployments initially authenticate with ADMIN_EMAIL / ADMIN_PASSWORD.
// On the first successful login, those credentials are migrated into AdminAccount.
async function bootstrapAdminAccount() {
  const existing = await findAdminAccount();
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(env.adminPassword, PASSWORD_ROUNDS);
  try {
    return await prisma.adminAccount.create({
      data: { id: ADMIN_ID, email: env.adminEmail, passwordHash },
    });
  } catch (error) {
    // Another simultaneous login may have created the singleton account first.
    if (error?.code === "P2002") {
      const racedAccount = await findAdminAccount();
      if (racedAccount) return racedAccount;
    }
    throw error;
  }
}

export async function loginAdmin({ email, password }) {
  let account = await findAdminAccount();

  if (!account) {
    const validLegacyCredentials =
      safeEqual(email.toLowerCase(), env.adminEmail) &&
      safeEqual(password, env.adminPassword);
    if (!validLegacyCredentials) throw httpError(401, "Wrong email or password.");
    account = await bootstrapAdminAccount();
  } else {
    const validEmail = safeEqual(email.toLowerCase(), account.email.toLowerCase());
    const validPassword = await bcrypt.compare(password, account.passwordHash);
    if (!validEmail || !validPassword) throw httpError(401, "Wrong email or password.");
  }

  const user = { email: account.email, name: "Admin" };
  const token = jwt.sign({ ...user, role: "admin" }, env.jwtSecret, { expiresIn: "7d" });
  return { token, user };
}

export async function getAdminSettings() {
  const account = await findAdminAccount();
  return { email: account?.email ?? env.adminEmail };
}

export async function updateAdminSettings({ currentPassword, email, password }) {
  let account = await findAdminAccount();

  if (!account) {
    // Supports a valid admin session issued before the first-login migration.
    if (!safeEqual(currentPassword, env.adminPassword)) {
      throw httpError(401, "Your current password is incorrect.");
    }
    account = await bootstrapAdminAccount();
  } else {
    const validPassword = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!validPassword) throw httpError(401, "Your current password is incorrect.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== account.email.toLowerCase()) {
    const emailInUse = await prisma.adminAccount.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (emailInUse && emailInUse.id !== ADMIN_ID) {
      throw httpError(409, "That administrator email address is already in use.");
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    const updated = await prisma.adminAccount.update({
      where: { id: ADMIN_ID },
      data: { email: normalizedEmail, passwordHash },
      select: { email: true },
    });
    return {
      email: updated.email,
      message: "Administrator login details updated successfully.",
    };
  } catch (error) {
    if (error?.code === "P2002") {
      throw httpError(409, "That administrator email address is already in use.");
    }
    throw error;
  }
}
