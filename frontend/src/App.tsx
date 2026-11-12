import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAdmin } from "./components/admin/RequireAdmin";
import { Layout } from "./components/Layout";
import { BlankFallback } from "./components/RouteFallbacks";
import { AuthProvider } from "./context/AuthContext";
import {
  AdminCategoriesPage,
  AdminCitiesPage,
  AdminCustomersPage,
  AdminDashboardPage,
  AdminLayout,
  AdminLoginPage,
  AdminOrdersPage,
  AdminProductsPage,
  ContactPage,
  HomePage,
  NotFoundPage,
  OrdersPage,
  ShopPage,
} from "./routes";

// Pages are loaded on demand (see routes.ts). Where the "loading" placeholder appears:
//  - storefront pages: inside <Layout>, so the navbar and footer stay put
//  - admin pages: inside <AdminLayout>, so the sidebar stays put
export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<BlankFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            {/* Checkout now happens inside the cart drawer. Old links go to the shop. */}
            <Route path="/checkout" element={<Navigate to="/shop" replace />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin: the login page is open, everything else needs a signed-in admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="users" element={<AdminCustomersPage />} />
              <Route path="delivery" element={<AdminCitiesPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
