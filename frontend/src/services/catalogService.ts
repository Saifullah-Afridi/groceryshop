import type { Category } from "../types";
import type { City } from "../types/order";
import { api } from "./apiClient";

// Public data for the shop: categories, and the cities we deliver to (with their fees).
export const getCategories = () => api<Category[]>("/categories", { auth: "none" });
export const getCities = () => api<City[]>("/cities", { auth: "none" });
