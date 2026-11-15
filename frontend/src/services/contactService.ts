import { api } from "./apiClient";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export function sendContactMessage(input: ContactMessage) {
  return api<{ message: string }>("/contact", {
    method: "POST",
    body: input,
    auth: "none",
  });
}
