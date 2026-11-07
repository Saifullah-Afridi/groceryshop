import type { Customer, RegisterInput } from "../types/customer";
import { api, setCustomerToken } from "./apiClient";

// Shopper accounts. The API emails a 6-digit code that must be confirmed before the first sign-in.
// These calls send no token (auth: "none"): the shopper is not signed in yet.

export const registerCustomer = (input: RegisterInput) =>
  api<{ email: string; message: string }>("/customers/register", { method: "POST", body: input, auth: "none" });

export const resendCustomerCode = (email: string) =>
  api<{ message: string }>("/customers/resend-otp", { method: "POST", body: { email }, auth: "none" });

// Confirming the code also signs the shopper in.
export async function verifyCustomerEmail(email: string, code: string): Promise<Customer> {
  const { token, user } = await api<{ token: string; user: Customer }>("/customers/verify-otp", {
    method: "POST",
    body: { email, code },
    auth: "none",
  });
  setCustomerToken(token);
  return user;
}

export async function loginCustomer(email: string, password: string): Promise<Customer> {
  const { token, user } = await api<{ token: string; user: Customer }>("/customers/login", {
    method: "POST",
    body: { email, password },
    auth: "none",
  });
  setCustomerToken(token);
  return user;
}
