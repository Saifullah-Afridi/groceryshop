import { z } from "zod";
import { MAX_QUANTITY } from "../orders/orders.validation.js";

const UNITS = ["kg", "item", "pack", "dozen", "bunch", "head", "bottle"];

// Form data arrives as text, so numbers are converted with z.coerce.
const fields = z.object({
  language: z.enum(["en", "ar"]).default("en"),
  removeImage: z.preprocess((value) => value === true || value === "true", z.boolean()).optional().default(false),
  name: z.string().trim().min(1, "Enter a product name").max(120),
  nameAr: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(2000).default(""),
  descriptionAr: z.string().trim().max(2000).optional().default(""),
  farm: z.string().trim().max(120).default(""),
  categoryId: z.string().trim().min(1, "Choose a category"),
  unit: z.enum(UNITS).default("kg"),
  price: z.coerce.number().positive("Price must be more than 0").max(10000),
  minQuantity: z.coerce.number().min(0, "Cannot be negative").max(MAX_QUANTITY, `Stock alert threshold cannot be more than ${MAX_QUANTITY}`).default(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot be more than 100%").default(0),
});

const checkStockThreshold = (data, ctx) => {
  const step = (data.unit ?? "kg") === "kg" ? 0.25 : 1;
  if (data.minQuantity !== undefined && data.minQuantity !== 0) {
    const steps = data.minQuantity / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minQuantity"],
        message: step === 0.25 ? "Stock alert threshold must use 0.25 kg steps." : "Stock alert threshold must be a whole number.",
      });
    }
  }
  if (data.stockQuantity !== undefined) {
    const stockSteps = data.stockQuantity / step;
    if (Math.abs(stockSteps - Math.round(stockSteps)) > 1e-9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stockQuantity"],
        message: step === 0.25 ? "Stock quantity must use 0.25 kg steps." : "Stock quantity must be a whole number.",
      });
    }
  }
};

export const createProductSchema = fields.superRefine(checkStockThreshold);
// On update the unit may not be sent. In that case the service re-checks against the stored unit.
export const updateProductSchema = fields.partial().superRefine((data, ctx) => (data.unit ? checkStockThreshold(data, ctx) : undefined));

export const listQuerySchema = z.object({
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc", "rating"]).default("featured"),
  offers: z.preprocess((v) => v === "1" || v === "true", z.boolean()).default(false),
});
