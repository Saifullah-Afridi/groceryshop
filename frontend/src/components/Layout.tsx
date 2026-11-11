import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { StorefrontFallback } from "./RouteFallbacks";

export function Layout() {
  const location = useLocation();

  // Use dark footer on the Shop page
  const isShopPage = location.pathname === "/shop";

  return (
    <>
      <Navbar />

      <main>
        <Suspense fallback={<StorefrontFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer variant={isShopPage ? "dark" : "light"} />

      <CartDrawer />
    </>
  );
}
