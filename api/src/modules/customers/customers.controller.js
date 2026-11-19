import { readPagination } from "../../lib/pagination.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { httpError } from "../../lib/httpError.js";
import { readId } from "../../lib/readId.js";
import {
  createCustomer, deleteCustomer, getAdminCustomer, getCustomer, listCustomers, loginCustomer,
  registerCustomer, resendOtp, updateCustomer, verifyEmail,
} from "./customers.service.js";
import {
  adminCreateSchema, adminUpdateSchema, loginSchema, registerSchema, resendSchema, verifySchema,
} from "./customers.validation.js";

// ---------- shoppers ----------
export const register = asyncHandler(async (req, res) => {
  res.status(201).json(await registerCustomer(registerSchema.parse(req.body)));
});

export const verify = asyncHandler(async (req, res) => {
  res.json(await verifyEmail(verifySchema.parse(req.body)));
});

export const resend = asyncHandler(async (req, res) => {
  res.json(await resendOtp(resendSchema.parse(req.body)));
});

export const login = asyncHandler(async (req, res) => {
  res.json(await loginCustomer(loginSchema.parse(req.body)));
});

export const me = asyncHandler(async (req, res) => {
  res.json(await getCustomer(req.auth.sub));
});

// ---------- admin ----------
export const list = asyncHandler(async (req, res) => {
  const query = readPagination(req.query);
  if (query.sort && !["newest", "oldest"].includes(query.sort)) throw httpError(400, "Invalid customer sort option.");
  res.json(await listCustomers(query));
});

export const adminGetOne = asyncHandler(async (req, res) => {
  const { page, limit, search } = readPagination(req.query);
  const allowedStatuses = ["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];
  if (req.query.status && !allowedStatuses.includes(req.query.status)) throw httpError(400, "Invalid order status filter.");
  const status = req.query.status || undefined;
  if (search) throw httpError(400, "Search is not supported for customer order history.");
  res.json(await getAdminCustomer(readId(req), { page, limit, status }));
});

export const adminCreate = asyncHandler(async (req, res) => {
  res.status(201).json(await createCustomer(adminCreateSchema.parse(req.body)));
});

export const adminUpdate = asyncHandler(async (req, res) => {
  res.json(await updateCustomer(readId(req), adminUpdateSchema.parse(req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCustomer(readId(req));
  res.status(204).end();
});
