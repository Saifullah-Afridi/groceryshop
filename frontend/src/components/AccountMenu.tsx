import { ClipboardList, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";

// The person icon in the navbar. Signed out: opens the sign-in window. Signed in: a small menu.
export function AccountMenu() {
  const { customer, openAuth, logout } = useCustomerAuth();
  const { t, isArabic } = useLanguage();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!customer) {
    return (
      <button
        type="button"
        onClick={() => openAuth()}
        aria-label={t("signIn")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-brand transition hover:border-brand"
      >
        <User size={19} />
      </button>
    );
  }

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("account")}
        className="grid h-10 w-10 place-items-center rounded-full bg-mint text-sm font-bold text-brand transition hover:ring-2 hover:ring-brand/30"
      >
        {customer.name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${isArabic ? "left-0" : "right-0"} top-12 z-50 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-lg`}
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {customer.name}
            </p>
            <p className="truncate text-xs text-muted">{customer.email}</p>
          </div>
          <Link
            role="menuitem"
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-card"
          >
            <ClipboardList size={17} /> My orders
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              toast.info(
                isArabic ? "تم تسجيل الخروج" : "You have been signed out",
              );
            }}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left text-sm text-sale hover:bg-red-50"
          >
            <LogOut size={17} /> {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
