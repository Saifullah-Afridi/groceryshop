import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { httpError } from "../../lib/httpError.js";
import { verificationEmail } from "../../lib/emailTemplates.js";
import { sendMail } from "../../lib/mailer.js";
import { generateOtp, hashOtp } from "../../lib/otp.js";
import { prisma } from "../../lib/prisma.js";
import { safeEqual } from "../../lib/safeEqual.js";
import { translateCustomerField } from "../../lib/translate.js";

const OTP_MINUTES = 10; // how long a code works
const OTP_MAX_ATTEMPTS = 5; // wrong guesses allowed per code
const RESEND_SECONDS = 60; // wait between emails

const toDto = (c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address, addressAr: c.addressAr ?? "" });

// Only a verified customer ever gets a token, so having one means the email was confirmed.
const signIn = (c) => ({
  token: jwt.sign({ sub: c.id, email: c.email, role: "customer" }, env.jwtSecret, { expiresIn: "30d" }),
  user: toDto(c),
});

const secondsUntilResend = (c) =>
  c.otpSentAt ? Math.max(0, Math.ceil((c.otpSentAt.getTime() + RESEND_SECONDS * 1000 - Date.now()) / 1000)) : 0;

// Reserve the resend window atomically before emailing. This prevents two
// simultaneous resend requests from issuing different valid codes.
async function sendOtp(customer) {
  const code = generateOtp();
  const otpHash = hashOtp(code, customer.id);
  const now = new Date();
  const resendCutoff = new Date(now.getTime() - RESEND_SECONDS * 1000);
  const claimed = await prisma.customer.updateMany({
    where: {
      id: customer.id,
      emailVerified: false,
      OR: [{ otpSentAt: null }, { otpSentAt: { lte: resendCutoff } }],
    },
    data: {
      otpHash,
      otpExpiresAt: new Date(now.getTime() + OTP_MINUTES * 60 * 1000),
      otpAttempts: 0,
      otpSentAt: now,
    },
  });

  if (claimed.count !== 1) {
    const latest = await prisma.customer.findUnique({ where: { id: customer.id } });
    const wait = latest ? secondsUntilResend(latest) : RESEND_SECONDS;
    throw httpError(429, `Please wait ${Math.max(wait, 1)} seconds before asking for a new code.`);
  }

  try {
    await sendMail({ to: customer.email, ...verificationEmail({ code, minutes: OTP_MINUTES }) });
  } catch (error) {
    // Clear only the code reserved by this request; never erase a newer code.
    await prisma.customer.updateMany({
      where: { id: customer.id, otpHash },
      data: { otpHash: null, otpExpiresAt: null, otpAttempts: 0, otpSentAt: null },
    });
    throw error;
  }
}

export async function registerCustomer({ name, email, phone, password, address, language = "en" }) {
  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.emailVerified) throw httpError(409, "An account with this email already exists. Try signing in.");
  let addressPair;
  try {
    addressPair = await translateCustomerField(address, language);
  } catch (error) {
    console.error("Customer registration address translation failed:", error.message);
    throw httpError(503, "Address translation is temporarily unavailable. Please try again in a moment.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // An unverified account can register again, for example after a typo or a lost code.
  const customer = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data: { name, phone, address: addressPair.en, addressAr: addressPair.ar, passwordHash } })
    : await prisma.customer.create({ data: { name, email, phone, address: addressPair.en, addressAr: addressPair.ar, passwordHash } });

  await sendOtp(customer);
  return { email: customer.email, message: "We sent a 6-digit code to your email." };
}

export async function verifyEmail({ email, code }) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.otpHash || !customer.otpExpiresAt) {
    throw httpError(400, "That code is not valid. Ask for a new one.");
  }
  const now = new Date();
  if (customer.otpExpiresAt < now) throw httpError(400, "That code has expired. Ask for a new one.");
  if (customer.otpAttempts >= OTP_MAX_ATTEMPTS) throw httpError(429, "Too many wrong tries. Ask for a new code.");

  const submittedHash = hashOtp(code, customer.id);
  if (!safeEqual(submittedHash, customer.otpHash)) {
    const counted = await prisma.customer.updateMany({
      where: {
        id: customer.id,
        emailVerified: false,
        otpHash: customer.otpHash,
        otpExpiresAt: { gt: now },
        otpAttempts: { lt: OTP_MAX_ATTEMPTS },
      },
      data: { otpAttempts: { increment: 1 } },
    });
    if (counted.count !== 1) throw httpError(429, "That code is no longer valid. Ask for a new one.");
    throw httpError(400, "That code is not correct.");
  }

  // A one-time conditional update prevents two concurrent requests from
  // redeeming the same OTP successfully.
  const verifiedCount = await prisma.customer.updateMany({
    where: {
      id: customer.id,
      emailVerified: false,
      otpHash: customer.otpHash,
      otpExpiresAt: { gt: now },
      otpAttempts: { lt: OTP_MAX_ATTEMPTS },
    },
    data: { emailVerified: true, otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
  });
  if (verifiedCount.count !== 1) {
    throw httpError(400, "That code is no longer valid. Ask for a new one.");
  }
  const verified = await prisma.customer.findUnique({ where: { id: customer.id } });
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

export async function listCustomers({ page = 1, limit = 20, search = "", sort = "newest" } = {}) {
  const where = search ? { OR: [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
  ] } : {};
  const orderBy = sort === "oldest" ? [{ id: "asc" }] : [{ id: "desc" }];
  const skip = (page - 1) * limit;
  const [rows, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, skip, take: limit, orderBy, select: { id: true, name: true, email: true, phone: true, address: true, addressAr: true, emailVerified: true, createdAt: true } }),
    prisma.customer.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { data: rows.map(adminDto), pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 && totalPages > 0 } };
}

// Admin customer profile with a snapshot of the customer's order history.
export async function getAdminCustomer(id, { page = 1, limit = 8, status, search = "" } = {}) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw httpError(404, "Customer not found.");
  const asNumber = Number(search);
  const where = {
    customerId: id,
    ...(status === "ON_THE_WAY" ? { status: { in: ["ON_THE_WAY", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } } : status ? { status } : {}),
    ...(search && { OR: [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      ...(Number.isInteger(asNumber) && asNumber > 0 ? [{ id: asNumber }] : []),
    ] }),
  };
  const baseWhere = { customerId: id };
  const skip = (page - 1) * limit;
  const [orders, total, grouped, aggregate, lastOrder] = await prisma.$transaction([
    prisma.order.findMany({ where, skip, take: limit, orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: { items: true } }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], where: baseWhere, _count: { _all: true } }),
    prisma.order.aggregate({ where: { ...baseWhere, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.findFirst({ where: baseWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { createdAt: true } }),
  ]);
  const statusCounts = { pending: 0, onTheWay: 0, delivered: 0, cancelled: 0 };
  for (const group of grouped) {
    const statusKey = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(group.status) ? "ON_THE_WAY" : group.status;
    const key = statusKey === "PENDING" ? "pending" : statusKey === "ON_THE_WAY" ? "onTheWay" : statusKey === "DELIVERED" ? "delivered" : "cancelled";
    statusCounts[key] += group._count._all;
  }
  const totalSpent = Number(aggregate._sum.total ?? 0);
  const dtoOrders = orders.map((order) => ({
    id: order.id,
    status: ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status) ? "ON_THE_WAY" : order.status,
    name: order.name, phone: order.phone, address: order.address, addressAr: order.addressAr ?? "",
    city: order.city, note: order.note, noteAr: order.noteAr ?? "",
    subtotal: Number(order.subtotal), deliveryFee: Number(order.deliveryFee), total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({ id: item.id, productId: item.productId, productName: item.productName, unit: item.unit, unitPrice: Number(item.unitPrice), quantity: item.quantity, lineTotal: Number(item.lineTotal) })),
  }));
  const totalPages = Math.ceil(total / limit);
  return {
    ...adminDto(customer),
    stats: {
      totalOrders: grouped.reduce((sum, group) => sum + group._count._all, 0),
      totalSpent,
      averageOrder: aggregate._count._all ? totalSpent / aggregate._count._all : 0,
      lastOrderAt: lastOrder?.createdAt?.toISOString() ?? null,
      ...statusCounts,
    },
    orders: dtoOrders,
    ordersPagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 && totalPages > 0 },
  };
}

// An account made by the admin is already verified.
export async function createCustomer({ password, language = "en", ...data }) {
  await assertEmailFree(data.email);
  const passwordHash = await bcrypt.hash(password, 12);
  let addressPair;
  try { addressPair = await translateCustomerField(data.address, language); }
  catch (error) {
    console.error("Admin customer address translation failed:", error.message);
    throw httpError(503, "Address translation is temporarily unavailable. Please try again in a moment.");
  }
  return adminDto(await prisma.customer.create({
    data: { ...data, address: addressPair.en, addressAr: addressPair.ar, passwordHash, emailVerified: true },
  }));
}

export async function updateCustomer(id, { password, language = "en", ...data }) {
  const current = await findOrFail(id);
  if (data.email) await assertEmailFree(data.email, id);
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  let addressFields = {};
  if (data.address !== undefined) {
    try { const pair = await translateCustomerField(data.address, language); addressFields = { address: pair.en, addressAr: pair.ar }; }
    catch (error) { throw httpError(503, "Address translation is temporarily unavailable. Please try again in a moment."); }
  }
  return adminDto(await prisma.customer.update({ where: { id }, data: { ...data, ...addressFields, ...(passwordHash && { passwordHash }) } }));
}

// Their old orders stay, with the delivery details they were placed with.
export async function deleteCustomer(id) {
  await findOrFail(id);
  await prisma.customer.delete({ where: { id } });
}
