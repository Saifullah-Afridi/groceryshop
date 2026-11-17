import { api, setToken } from "./apiClient";

export interface AdminUser {
  email: string;
  name: string;
}

// The API checks the email and password and sends back a token for later requests.
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const { token, user } = await api<{ token: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(token);
  return user;
}


export interface AdminSettings { email: string }

export async function getAdminSettings(): Promise<AdminSettings> {
  return api<AdminSettings>("/auth/settings");
}

export async function updateAdminSettings(input: { currentPassword: string; email: string; password: string }): Promise<{ email: string; message: string }> {
  return api<{ email: string; message: string }>("/auth/settings", { method: "PUT", body: input });
}
