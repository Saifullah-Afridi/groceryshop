// One place that talks to the Rakan API. Services call api(); nothing else uses fetch directly.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// The admin and the shopper each have their own token and saved session.
const ADMIN_TOKEN = "rakan-admin-token";
const ADMIN_SESSION = "rakan-admin-session"; // same key AuthContext uses
const CUSTOMER_TOKEN = "rakan-customer-token";
const CUSTOMER_SESSION = "rakan-customer-session"; // same key CustomerAuthContext uses
export const CUSTOMER_EXPIRED = "rakan:customer-expired";

export const setToken = (token: string) => localStorage.setItem(ADMIN_TOKEN, token);
export const clearToken = () => localStorage.removeItem(ADMIN_TOKEN);
export const setCustomerToken = (token: string) => localStorage.setItem(CUSTOMER_TOKEN, token);
export const clearCustomerToken = () => localStorage.removeItem(CUSTOMER_TOKEN);

// An error that can carry a code from the API, for example "EMAIL_NOT_VERIFIED".
export type ApiError = Error & { code?: string };

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown; // a FormData (files) or any object (sent as JSON)
  auth?: "admin" | "customer" | "none"; // whose token to send. Admin by default.
}

export async function api<T>(path: string, { method = "GET", body, auth = "admin" }: Options = {}): Promise<T> {
  const tokenKey = auth === "admin" ? ADMIN_TOKEN : auth === "customer" ? CUSTOMER_TOKEN : null;
  const token = tokenKey ? localStorage.getItem(tokenKey) : null;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // the browser sets the multipart header itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Check that the API is running.");
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // An expired or invalid session: forget it. The admin is sent to the login page.
    if (response.status === 401 && token && tokenKey) {
      localStorage.removeItem(tokenKey);
      if (auth === "admin") {
        localStorage.removeItem(ADMIN_SESSION);
        window.location.assign("/admin/login");
      } else {
        localStorage.removeItem(CUSTOMER_SESSION);
        window.dispatchEvent(new Event(CUSTOMER_EXPIRED));
      }
    }
    throw Object.assign(new Error(data?.message ?? "Something went wrong. Try again."), { code: data?.code });
  }
  return data as T;
}
