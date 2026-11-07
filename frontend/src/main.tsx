import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { AuthModal } from "./components/auth/AuthModal";
import { CartProvider } from "./context/CartContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CustomerAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
          <AuthModal />
        </CustomerAuthProvider>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} limit={3} closeOnClick pauseOnHover />
    </QueryClientProvider>
  </StrictMode>,
);
