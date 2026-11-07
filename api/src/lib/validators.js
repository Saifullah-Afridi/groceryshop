import { z } from "zod";

// Shared rules, so every feature checks a phone number the same way.
export const phone = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[\d\s-]+$/.test(value) && digits >= 8 && digits <= 15;
}, "Enter a valid phone number");
