import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import i18n from "../i18n";
import { CUSTOMER_EXPIRED, clearCustomerToken } from "../services/apiClient";
import type { Customer } from "../types/customer";

interface CustomerAuthValue {
  customer: Customer | null;
  isAuthOpen: boolean;
  // Opens the sign-in window. `afterSignIn` runs once the shopper has signed in.
  openAuth: (afterSignIn?: () => void) => void;
  closeAuth: () => void;
  signIn: (customer: Customer) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthValue | null>(null);
const KEY = "rakan-customer-session";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // The signed-in shopper is kept in the browser so a refresh does not sign them out.
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const afterSignIn = useRef<(() => void) | null>(null);

  // The API said the login token is no longer valid (for example it expired).
  useEffect(() => {
    const onExpired = () => {
      setCustomer(null);
      toast.error(i18n.t("auth.sessionExpired"));
    };
    window.addEventListener(CUSTOMER_EXPIRED, onExpired);
    return () => window.removeEventListener(CUSTOMER_EXPIRED, onExpired);
  }, []);

  const openAuth = useCallback((then?: () => void) => {
    afterSignIn.current = then ?? null;
    setIsAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    afterSignIn.current = null;
    setIsAuthOpen(false);
  }, []);

  const signIn = useCallback((signedIn: Customer) => {
    localStorage.setItem(KEY, JSON.stringify(signedIn));
    setCustomer(signedIn);
    setIsAuthOpen(false);

    const next = afterSignIn.current;
    afterSignIn.current = null;
    if (next) next();
    else toast.success(i18n.t("auth.welcome", { name: signedIn.name.split(" ")[0] }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    clearCustomerToken();
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, isAuthOpen, openAuth, closeAuth, signIn, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  return ctx;
}
