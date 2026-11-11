import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { httpError } from "../../lib/httpError.js";
import { verificationEmail } from "../../lib/emailTemplates.js";
import { sendMail } from "../../lib/mailer.js";
import { generateOtp, hashOtp } from "../../lib/otp.js";
import { prisma } from "../../lib/prisma.js";
import { safeEqual } from "../../lib/safeEqual.js";

const OTP_MINUTES = 10; // how long a code works
const OTP_MAX_ATTEMPTS = 5; // wrong guesses allowed per code
const RESEND_SECONDS = 60; // wait between emails

const toDto = (c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address });

// Only a verified customer ever gets a token, so having one means the email was confirmed.
const signIn = (c) => ({
  token: jwt.sign({ sub: c.id, email: c.email, role: "customer" }, env.jwtSecret, { expiresIn: "30d" }),
  user: toDto(c),
});

const secondsUntilResend = (c) =>
  c.otpSentAt ? Math.max(0, Math.ceil((c.otpSentAt.getTime() + RESEND_SECONDS * 1000 - Date.now()) / 1000)) : 0;

// Email a fresh code and save its hash. If the email fails, nothing is saved.
async function sendOtp(customer) {
  const code = generateOtp();
  await sendMail({ to: customer.email, ...verificationEmail({ code, minutes: OTP_MINUTES }) });
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      otpHash: hashOtp(code, customer.id),
      otpExpiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000),
      otpAttempts: 0,
      otpSentAt: new Date(),
    },
  });
}

export async function registerCustomer({ name, email, phone, password, address }) {
  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.emailVerified) throw httpError(409, "An account with this email already exists. Try signing in.");

  const passwordHash = await bcrypt.hash(password, 12);
  // An unverified account can register again, for example after a typo or a lost code.
  const customer = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data: { name, phone, address, passwordHash } })
    : await prisma.customer.create({ data: { name, email, phone, address, passwordHash } });

  await sendOtp(customer);
  return { email: customer.email, message: "We sent a 6-digit code to your email." };
}

export async function verifyEmail({ email, code }) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.otpHash || !customer.otpExpiresAt) {
    throw httpError(400, "That code is not valid. Ask for a new one.");
  }
  if (customer.otpExpiresAt < new Date()) throw httpError(400, "That code has expired. Ask for a new one.");
  if (customer.otpAttempts >= OTP_MAX_ATTEMPTS) throw httpError(429, "Too many wrong tries. Ask for a new code.");

  if (!safeEqual(hashOtp(code, customer.id), customer.otpHash)) {
    await prisma.customer.update({ where: { id: customer.id }, data: { otpAttempts: { increment: 1 } } });
    throw httpError(400, "That code is not correct.");
  }

  const verified = await prisma.customer.update({
    where: { id: customer.id },
    data: { emailVerified: true, otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
  });
  return signIn(verified);
}

export async function resendOtp({ email }) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  // The same reply for every case, so nobody can use this to find out which emails have accounts.
  const reply = { message: "If that email is waiting for verification, we sent a new code." };
  if (!customer || customer.emailVerified) return reply;

  const wait = secondsUntilResend(customer);
  if (wait > 0) throw httpError(429, `Please wait ${wait} seconds before asking for a new code.`);
  await sendOtp(customer);
  return reply;
}

let dummyHash; // lets a wrong email take as long as a wrong password
export async function loginCustomer({ email, password }) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  dummyHash ??= await bcrypt.hash("not-a-real-password", 12);
  const valid = await bcrypt.compare(password, customer?.passwordHash ?? dummyHash);
  if (!customer || !valid) throw httpError(401, "Wrong email or password.");

  if (!customer.emailVerified) {
    if (secondsUntilResend(customer) === 0) await sendOtp(customer);
    throw httpError(403, "Please verify your email first. We sent you a code.", "EMAIL_NOT_VERIFIED");
  }
  return signIn(customer);
}

export async function getCustomer(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw httpError(404, "Account not found.");
  return toDto(customer);
}

// ---------- admin ----------
const adminDto = (c) => ({ ...toDto(c), emailVerified: c.emailVerified, createdAt: c.createdAt.toISOString() });

async function findOrFail(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw httpError(404, "Customer not found.");
  return customer;
}

async function assertEmailFree(email, exceptId) {
  const same = await prisma.customer.findUnique({ where: { email } });
  if (same && same.id !== exceptId) throw httpError(409, "An account with this email already exists.");
}

export async function listCustomers() {
  const rows = await prisma.customer.findMany({ orderBy: { id: "desc" } });
  return rows.map(adminDto);
}

// An account made by the admin is already verified.
export async function createCustomer({ password, ...data }) {
  await assertEmailFree(data.email);
  const passwordHash = await bcrypt.hash(password, 12);
  return adminDto(await prisma.customer.create({ data: { ...data, passwordHash, emailVerified: true } }));
}

export async function updateCustomer(id, { password, ...data }) {
  await findOrFail(id);
  if (data.email) await assertEmailFree(data.email, id);
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  return adminDto(await prisma.customer.update({ where: { id }, data: { ...data, ...(passwordHash && { passwordHash }) } }));
}

// Their old orders stay, with the delivery details they were placed with.
export async function deleteCustomer(id) {
  await findOrFail(id);
  await prisma.customer.delete({ where: { id } });
}
