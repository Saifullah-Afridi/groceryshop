import type { Category, Product } from "../types";
import type { CategoryInput, ProductInput } from "../types/admin";
import type { AdminCustomer, CustomerInput } from "../types/customer";
import type { City, CityInput, Order, OrderStatus } from "../types/order";
import { api } from "./apiClient";

export interface PaginationMeta {
  page: number; limit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPreviousPage: boolean;
}
export interface PaginatedResponse<T> { data: T[]; pagination: PaginationMeta }
export interface AdminListQuery { page?: number; limit?: number; search?: string; q?: string; sort?: string; category?: string; archived?: boolean; stock?: "out" | "low"; status?: OrderStatus }
function listParams(query: AdminListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

// Every function here is one API call. Images are sent as multipart form data.

function categoryForm(input: CategoryInput, imageFile?: File | null) {
  const form = new FormData();
  form.append("name", input.name);
  form.append("language", input.language);
  if (input.removeImage) form.append("removeImage", "true");
  form.append("icon", input.icon);
  form.append("color", input.color);
  form.append("tint", input.tint);
  if (imageFile) form.append("image", imageFile);
  return form;
}

function productForm(input: ProductInput, imageFile?: File | null) {
  const form = new FormData();
  form.append("name", input.name);
  form.append("language", input.language);
  if (input.removeImage) form.append("removeImage", "true");
  form.append("categoryId", input.categoryId);
  form.append("price", String(input.price));
  form.append("unit", input.unit);
  form.append("minQuantity", String(input.minQuantity));
  form.append("stockQuantity", String(input.stockQuantity));
  form.append("discount", String(input.discount));
  if (imageFile) form.append("image", imageFile);
  return form;
}

// ---------- categories ----------
export const getAdminCategories = (query: AdminListQuery = {}) => api<PaginatedResponse<Category>>(`/categories/admin/all?${listParams(query)}`);

export const createCategory = (input: CategoryInput, imageFile?: File | null) =>
  api<Category>("/categories", { method: "POST", body: categoryForm(input, imageFile) });

export const updateCategory = (id: string, input: CategoryInput, imageFile?: File | null) =>
  api<Category>(`/categories/${encodeURIComponent(id)}`, { method: "PUT", body: categoryForm(input, imageFile) });

export const deleteCategory = (id: string) => api<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" });

// ---------- products ----------
export const getAdminProducts = (query: AdminListQuery = {}) => api<PaginatedResponse<Product>>(`/products/admin/all?${listParams(query)}`);

export const createProduct = (input: ProductInput, imageFile?: File | null) =>
  api<Product>("/products", { method: "POST", body: productForm(input, imageFile) });

export const updateProduct = (id: number, input: ProductInput, imageFile?: File | null) =>
  api<Product>(`/products/${id}`, { method: "PUT", body: productForm(input, imageFile) });

export const deleteProduct = (id: number) => api<void>(`/products/${id}/archive`, { method: "POST" });
export const restoreProduct = (id: number) => api<Product>(`/products/${id}/restore`, { method: "POST" });

// ---------- delivery cities ----------
export const getAdminCities = (query: AdminListQuery = {}) => api<PaginatedResponse<City>>(`/cities/all?${listParams(query)}`);
export const createCity = (input: CityInput) => api<City>("/cities", { method: "POST", body: input });
export const updateCity = (id: number, input: CityInput) => api<City>(`/cities/${id}`, { method: "PUT", body: input });
export const deleteCity = (id: number) => api<void>(`/cities/${id}`, { method: "DELETE" });

// ---------- customers ----------
export const getAdminCustomers = (query: AdminListQuery = {}) => api<PaginatedResponse<AdminCustomer>>(`/customers?${listParams(query)}`);

export interface AdminCustomerDetails extends AdminCustomer {
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrder: number;
    lastOrderAt: string | null;
    pending: number;
    onTheWay: number;
    delivered: number;
    cancelled: number;
  };
  orders: Order[];
  ordersPagination?: PaginationMeta;
}
export const getAdminCustomer = (id: number, query: AdminListQuery = {}) => api<AdminCustomerDetails & { ordersPagination: PaginationMeta }>(`/customers/${id}?${listParams(query)}`);
export const createCustomer = (input: CustomerInput) => api<AdminCustomer>("/customers", { method: "POST", body: input });
export const updateCustomer = (id: number, input: CustomerInput) =>
  api<AdminCustomer>(`/customers/${id}`, { method: "PUT", body: { ...input, password: input.password || undefined } });
export const deleteCustomer = (id: number) => api<void>(`/customers/${id}`, { method: "DELETE" });

// ---------- orders ----------
export interface AdminOrdersResponse extends PaginatedResponse<Order> { statusCounts: Record<OrderStatus, number> }
export function getAdminOrders(query: AdminListQuery = {}) {
  return api<AdminOrdersResponse>(`/orders?${listParams(query)}`);
}
export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api<Order>(`/orders/${id}/status`, { method: "PUT", body: { status } });

export interface DashboardData {
  todayRevenue: number; todayOrders: number; averageOrderValue: number;
  monthRevenue: number; pendingOrders: number; productsCount: number;
  categoriesCount: number; newCustomersToday: number;
  lowStockCount: number; outOfStockCount: number;
  lowStock: { id:number; name:string; nameAr:string; stockQuantity:number; minQuantity:number; unit:string }[];
  outOfStock: { id:number; name:string; nameAr:string; stockQuantity:number; unit:string }[];
  bestSellers: { name:string; quantity:number; revenue:number }[];
  recentOrders: { id:number; name:string; total:number; status:string; createdAt:string; itemsCount:number }[];
}
export const getDashboard = () => api<DashboardData>("/admin/dashboard");
