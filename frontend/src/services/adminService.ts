import type { Category, Product } from "../types";
import type { CategoryInput, ProductInput } from "../types/admin";
import type { AdminCustomer, CustomerInput } from "../types/customer";
import type { City, CityInput, Order, OrderStatus } from "../types/order";
import { api } from "./apiClient";

// Every function here is one API call. Images are sent as multipart form data.

function categoryForm(input: CategoryInput, imageFile?: File | null) {
  const form = new FormData();
  form.append("name", input.name);
  form.append("description", input.description ?? "");
  form.append("icon", input.icon);
  form.append("color", input.color);
  form.append("tint", input.tint);
  if (imageFile) form.append("image", imageFile);
  return form;
}

function productForm(input: ProductInput, imageFile?: File | null) {
  const form = new FormData();
  form.append("name", input.name);
  form.append("description", input.description);
  form.append("categoryId", input.categoryId);
  form.append("price", String(input.price));
  form.append("unit", input.unit);
  form.append("minQuantity", String(input.minQuantity));
  if (imageFile) form.append("image", imageFile);
  return form;
}

// ---------- categories ----------
export const getAdminCategories = () => api<Category[]>("/categories");

export const createCategory = (input: CategoryInput, imageFile?: File | null) =>
  api<Category>("/categories", { method: "POST", body: categoryForm(input, imageFile) });

export const updateCategory = (id: string, input: CategoryInput, imageFile?: File | null) =>
  api<Category>(`/categories/${encodeURIComponent(id)}`, { method: "PUT", body: categoryForm(input, imageFile) });

export const deleteCategory = (id: string) => api<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" });

// ---------- products ----------
export const getAdminProducts = () => api<Product[]>("/products");

export const createProduct = (input: ProductInput, imageFile?: File | null) =>
  api<Product>("/products", { method: "POST", body: productForm(input, imageFile) });

export const updateProduct = (id: number, input: ProductInput, imageFile?: File | null) =>
  api<Product>(`/products/${id}`, { method: "PUT", body: productForm(input, imageFile) });

export const deleteProduct = (id: number) => api<void>(`/products/${id}`, { method: "DELETE" });

// ---------- delivery cities ----------
export const getAdminCities = () => api<City[]>("/cities/all");
export const createCity = (input: CityInput) => api<City>("/cities", { method: "POST", body: input });
export const updateCity = (id: number, input: CityInput) => api<City>(`/cities/${id}`, { method: "PUT", body: input });
export const deleteCity = (id: number) => api<void>(`/cities/${id}`, { method: "DELETE" });

// ---------- customers ----------
export const getAdminCustomers = () => api<AdminCustomer[]>("/customers");
export const createCustomer = (input: CustomerInput) => api<AdminCustomer>("/customers", { method: "POST", body: input });
export const updateCustomer = (id: number, input: CustomerInput) =>
  api<AdminCustomer>(`/customers/${id}`, { method: "PUT", body: { ...input, password: input.password || undefined } });
export const deleteCustomer = (id: number) => api<void>(`/customers/${id}`, { method: "DELETE" });

// ---------- orders ----------
export function getAdminOrders(query: { status?: OrderStatus; q?: string }) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.q) params.set("q", query.q);
  return api<Order[]>(`/orders?${params}`);
}
export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api<Order>(`/orders/${id}/status`, { method: "PUT", body: { status } });
