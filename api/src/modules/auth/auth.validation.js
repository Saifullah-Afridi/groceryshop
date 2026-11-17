import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const updateAdminSettingsSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "New password must be at least 8 characters").max(72),
});
