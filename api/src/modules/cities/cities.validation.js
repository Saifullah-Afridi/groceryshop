import { z } from "zod";

const fields = z.object({
  name: z.string().trim().min(1, "Enter a city name").max(80),
  fee: z.coerce.number().min(0, "The fee cannot be negative").max(1000),
  active: z.boolean().default(true),
});

export const createCitySchema = fields;
export const updateCitySchema = fields.partial();
