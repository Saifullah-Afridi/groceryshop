import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import "./i18n"; // must load before anything that shows text

import App from "./App";
import { AuthModal } from "./components/auth/AuthModal";

import { CartProvider } from "./context/CartContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading states are handled where the data is used (skeletons) and by route-level code splitting
// (see App.tsx). There is no full-screen loader.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* v7_startTransition keeps the current page on screen until the next page has downloaded */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CustomerAuthProvider>
            <CartProvider>
              <App />
            </CartProvider>

            <AuthModal />
          </CustomerAuthProvider>
        </BrowserRouter>

        <ToastContainer
          position="top-right"
          autoClose={2500}
          limit={3}
          closeOnClick
          pauseOnHover
        />
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
);
