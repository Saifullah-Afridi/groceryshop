import { z } from "zod";
import { MAX_QUANTITY } from "../orders/orders.validation.js";

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
  minQuantity: z.coerce.number().min(0, "Cannot be negative").max(MAX_QUANTITY, `Minimum order cannot be more than ${MAX_QUANTITY}`).default(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot be more than 100%").default(0),
});

// The minimum order must go up in the same steps the shopper buys in: 0.25 kg for weighed products, whole pieces otherwise.
// (So 2.25 kg is fine, 2.1 kg is not.)
const checkMinimum = (data, ctx) => {
  if (data.minQuantity === undefined || data.minQuantity === 0) return;
  const step = (data.unit ?? "kg") === "kg" ? 0.25 : 1;
  const steps = data.minQuantity / step;
  if (Math.abs(steps - Math.round(steps)) > 1e-9) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minQuantity"],
      message: step === 0.25 ? "Minimum quantity must go up in steps of 0.25 kg (for example 0.5 or 2.25)" : "Minimum quantity must be a whole number",
    });
  }
};

export const createProductSchema = fields.superRefine(checkMinimum);
// On update the unit may not be sent. In that case the service re-checks against the stored unit.
export const updateProductSchema = fields.partial().superRefine((data, ctx) => (data.unit ? checkMinimum(data, ctx) : undefined));

export const listQuerySchema = z.object({
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc", "rating"]).default("featured"),
  offers: z.preprocess((v) => v === "1" || v === "true", z.boolean()).default(false),
});
