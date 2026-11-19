import { z } from "zod";
import { httpError } from "./httpError.js";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "oldest", "name-asc", "name-desc", "price-asc", "price-desc", "fee-asc", "fee-desc"]).optional(),
});

export function readPagination(query) {
  const parsed = paginationQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw httpError(400, parsed.error.issues[0]?.message ?? "Invalid pagination parameters.");
  }
  const { page, limit, search, q, sort } = parsed.data;
  return { page, limit, search: search ?? q ?? "", sort };
}

