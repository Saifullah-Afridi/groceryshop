import { lazyRoute, named } from "./utils/lazyRoute";

// Every page is its own downloadable chunk. A visitor only downloads the pages they open,
// and the admin panel code is never sent to shoppers.
export const HomePage = lazyRoute(named(() => import("./pages/HomePage"), "HomePage"));
export const ShopPage = lazyRoute(named(() => import("./pages/ShopPage"), "ShopPage"));
export const OrdersPage = lazyRoute(named(() => import("./pages/OrdersPage"), "OrdersPage"));
export const ContactPage = lazyRoute(named(() => import("./pages/ContactPage"), "ContactPage"));
export const NotFoundPage = lazyRoute(named(() => import("./pages/NotFoundPage"), "NotFoundPage"));

export const AdminLoginPage = lazyRoute(named(() => import("./pages/admin/AdminLoginPage"), "AdminLoginPage"));
export const AdminLayout = lazyRoute(named(() => import("./components/admin/AdminLayout"), "AdminLayout"));
export const AdminDashboardPage = lazyRoute(named(() => import("./pages/admin/AdminDashboardPage"), "AdminDashboardPage"));
export const AdminOrdersPage = lazyRoute(named(() => import("./pages/admin/AdminOrdersPage"), "AdminOrdersPage"));
export const AdminProductsPage = lazyRoute(named(() => import("./pages/admin/AdminProductsPage"), "AdminProductsPage"));
export const AdminCategoriesPage = lazyRoute(named(() => import("./pages/admin/AdminCategoriesPage"), "AdminCategoriesPage"));
export const AdminCustomersPage = lazyRoute(named(() => import("./pages/admin/AdminCustomersPage"), "AdminCustomersPage"));
export const AdminCitiesPage = lazyRoute(named(() => import("./pages/admin/AdminCitiesPage"), "AdminCitiesPage"));

// Used by links: hover or focus a link and its page starts downloading.
export const PRELOAD: Record<string, () => Promise<unknown>> = {
  "/": HomePage.preload,
  "/shop": ShopPage.preload,
  "/orders": OrdersPage.preload,
  "/contact": ContactPage.preload,
};
