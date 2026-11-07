import type { Product, ProductQuery } from "../types";
import { api } from "./apiClient";

// Products come from the API. The admin dashboard is where they are created and changed.
export function getProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  return api<Product[]>(`/products?${params}`, { auth: "none" });
}

export const getProduct = (id: number) => api<Product>(`/products/${id}`, { auth: "none" });
