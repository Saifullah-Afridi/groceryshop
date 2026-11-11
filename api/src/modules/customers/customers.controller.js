import { asyncHandler } from "../../lib/asyncHandler.js";
import { readId } from "../../lib/readId.js";
import {
  createCustomer, deleteCustomer, getCustomer, getCustomerHistory, listCustomers, loginCustomer,
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
export const list = asyncHandler(async (_req, res) => {
  res.json(await listCustomers());
});

export const history = asyncHandler(async (req, res) => {
  res.json(await getCustomerHistory(readId(req)));
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
