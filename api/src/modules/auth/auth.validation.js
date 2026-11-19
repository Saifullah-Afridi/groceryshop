import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email"),
  password: z.string().min(1, "Enter your password"),
});

export const updateAdminSettingsSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  email: z.string().trim().email("Enter a valid administrator email address."),
  password: z.string().min(8, "The new password must contain at least 8 characters."),
});
