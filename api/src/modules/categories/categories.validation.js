import { z } from "zod";

const ICONS = ["Carrot", "Apple", "Beef", "Milk", "CupSoda", "Wheat"];
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a color like #138040");

const fields = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(80),
  nameAr: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().max(500).default(""),
  descriptionAr: z.string().trim().max(500).optional().default(""),
  icon: z.enum(ICONS).default("Carrot"),
  color: hexColor.default("#138040"),
  tint: hexColor.default("#dff3e0"),
});

export const createCategorySchema = fields;
export const updateCategorySchema = fields.partial();
