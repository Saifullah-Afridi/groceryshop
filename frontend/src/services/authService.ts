import { api, setToken } from "./apiClient";

export interface AdminUser {
  email: string;
  name: string;
}

export interface AdminSettings {
  email: string;
}

export interface UpdateAdminSettingsInput {
  currentPassword: string;
  email: string;
  password: string;
}

export interface UpdateAdminSettingsResult extends AdminSettings {
  message: string;
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

export function getAdminSettings(): Promise<AdminSettings> {
  return api<AdminSettings>("/auth/settings");
}

export function updateAdminSettings(
  input: UpdateAdminSettingsInput,
): Promise<UpdateAdminSettingsResult> {
  return api<UpdateAdminSettingsResult>("/auth/settings", {
    method: "PUT",
    body: input,
  });
}
