import { asyncHandler } from "../../lib/asyncHandler.js";
import { readId } from "../../lib/readId.js";
import { cancelMyOrder, createOrder, getOrder, listMyOrders, listOrders, setOrderStatus } from "./orders.service.js";
import { createOrderSchema, listQuerySchema, statusSchema } from "./orders.validation.js";

// req.auth.sub is the customer id, taken from the signed token. It is never read from the request body.
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await createOrder(req.auth.sub, createOrderSchema.parse(req.body)));
});

export const listMine = asyncHandler(async (req, res) => {
  res.json(await listMyOrders(req.auth.sub));
});

export const cancel = asyncHandler(async (req, res) => {
  res.json(await cancelMyOrder(req.auth.sub, readId(req)));
});

export const listAll = asyncHandler(async (req, res) => {
  res.json(await listOrders(listQuerySchema.parse(req.query)));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await getOrder(readId(req)));
});

export const updateStatus = asyncHandler(async (req, res) => {
  res.json(await setOrderStatus(readId(req), statusSchema.parse(req.body).status));
});
