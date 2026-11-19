import { readPagination } from "../../lib/pagination.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { httpError } from "../../lib/httpError.js";
import { archiveProduct, createProduct, getProduct, getSearchSuggestions, listProducts, restoreProduct, updateProduct } from "./products.service.js";
import { createProductSchema, listQuerySchema, updateProductSchema } from "./products.validation.js";

function readId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw httpError(400, "Invalid product id.");
  return id;
}

export const list = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  res.json(await listProducts({ ...query, includeArchived: false }));
});

export const adminList = asyncHandler(async (req, res) => {
  const pagination = readPagination(req.query);
  const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
  const allowedSorts = ["newest", "oldest", "price-asc", "price-desc"];
  if (req.query.sort && !allowedSorts.includes(req.query.sort)) throw httpError(400, "Invalid product sort option.");
  const sort = req.query.sort || "oldest";
  if (req.query.archived !== undefined && !["true", "false", "1", "0"].includes(req.query.archived)) {
    throw httpError(400, "Invalid archived filter.");
  }
  const archivedOnly = req.query.archived === "true" || req.query.archived === "1";
  res.json(await listProducts({ ...pagination, q: pagination.search, category, sort, includeArchived: true, archivedOnly }));
});

export const suggestions = asyncHandler(async (req, res) => {
  const query = String(req.query.q ?? "").trim();
  if (query.length < 2 || query.length > 80) return res.json({ products: [], categories: [] });
  res.json(await getSearchSuggestions(query));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await getProduct(readId(req)));
});

export const create = asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body);
  res.status(201).json(await createProduct(data, req.file));
});

export const update = asyncHandler(async (req, res) => {
  const data = updateProductSchema.parse(req.body);
  res.json(await updateProduct(readId(req), data, req.file));
});

export const remove = asyncHandler(async (req, res) => {
  res.json(await archiveProduct(readId(req)));
});

export const restore = asyncHandler(async (req, res) => {
  res.json(await restoreProduct(readId(req)));
});
