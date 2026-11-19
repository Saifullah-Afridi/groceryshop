import { z } from "zod";
import { phone, suggestEmailFix } from "../../lib/validators.js";

const email = z.string().trim().toLowerCase().email("Enter a valid email address");
// Used when an account is created: refuses a mistyped domain and says what was probably meant.
const newEmail = email.superRefine((value, ctx) => {
  const fix = suggestEmailFix(value);
  if (fix) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Did you mean ${fix}?` });
});
const name = z.string().trim().min(2, "Enter the name").max(80);
const address = z.string().trim().min(5, "Enter the delivery address").max(300);
// bcrypt only reads the first 72 bytes, so longer passwords are refused
const password = z.string().min(8, "Use at least 8 characters").max(72, "Use 72 characters or fewer");

export const registerSchema = z.object({ name, email: newEmail, phone, password, address, language: z.enum(["en", "ar"]).default("en") });
export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });
export const verifySchema = z.object({ email, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });
export const resendSchema = z.object({ email });

// Admin: the password is optional when editing (leave it out to keep the current one).
export const adminCreateSchema = registerSchema;
export const adminUpdateSchema = z.object({ name, email, phone, address, language: z.enum(["en", "ar"]).default("en"), password: password.optional() }).partial();
