import { z } from "zod";

const UNITS = ["kg", "item", "pack", "dozen", "bunch", "head", "bottle"];

// Form data arrives as text, so numbers are converted with z.coerce.
const fields = z.object({
  name: z.string().trim().min(1, "Enter a product name").max(120),
  nameAr: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(2000).default(""),
  descriptionAr: z.string().trim().max(2000).optional().default(""),
  farm: z.string().trim().max(120).default(""),
  categoryId: z.string().trim().min(1, "Choose a category"),
  unit: z.enum(UNITS).default("kg"),
  price: z.coerce.number().positive("Price must be more than 0").max(10000),
  minQuantity: z.coerce.number().min(0, "Cannot be negative").default(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  unitPrices: z.preprocess(v => typeof v === "string" ? JSON.parse(v || "{}") : (v ?? {}), z.record(z.string(), z.coerce.number().min(0))).default({}),
  unitDiscounts: z.preprocess(v => typeof v === "string" ? JSON.parse(v || "{}") : (v ?? {}), z.record(z.string(), z.coerce.number().min(0).max(100))).default({}),
});

export const createProductSchema = fields;
export const updateProductSchema = fields.partial();

export const listQuerySchema = z.object({
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc", "rating"]).default("featured"),
});
