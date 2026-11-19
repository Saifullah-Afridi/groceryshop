import { z } from "zod";
import { phone } from "../../lib/validators.js";

export const MAX_QUANTITY = 50; // the most of one product in one order (kg, or pieces)
export const ORDER_STATUSES = ["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];

// Notice what is NOT here: no price, no delivery fee, no total. The server works those out itself.
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().positive("Quantity must be more than 0").max(MAX_QUANTITY, `The most you can order of one product is ${MAX_QUANTITY}`),
      }),
    )
    .min(1, "Your cart is empty")
    .max(100, "Too many products in one order"),
  cityId: z.coerce.number().int().positive("Choose your city"),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone,
  address: z.string().trim().min(5, "Enter your delivery address").max(300),
  note: z.string().trim().max(300).default(""),
  language: z.enum(["en", "ar"]).default("en"),
});

export const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export const listQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
