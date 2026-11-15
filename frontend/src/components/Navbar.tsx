import { useState } from "react";
import { Globe, ShoppingCart, Menu, X } from "lucide-react";
import { Link, NavLink, useSearchParams } from "react-router-dom";

import { STORE } from "../config";
import { useCart } from "../context/CartContext";
import { PRELOAD } from "../routes";
import { useLanguage } from "../context/LanguageContext";

import { AccountMenu } from "./AccountMenu";
import { Container } from "./Container";
import { NavbarSearch } from "./NavbarSearch";

export function Navbar() {
  const { count, open } = useCart();
  const { language, toggleLanguage, t } = useLanguage();

  const [params] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-green-50 text-brand"
        : "text-neutral-700 hover:bg-green-50 hover:text-brand"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent pt-0 sm:pt-5">
      {" "}
      <Container>
        <div className="relative rounded-2xl border border-white/80 bg-white/95 p-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:rounded-full sm:px-5 sm:py-3 lg:px-8">
          {/* Main navbar row */}
          <div className="flex min-h-10 items-center gap-2 sm:gap-3 lg:gap-5">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex shrink-0 items-center gap-2 text-base font-extrabold tracking-tight text-brand sm:text-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-base font-bold text-white sm:h-10 sm:w-10">
                R
              </span>
              <span>{STORE.name}</span>
            </Link>

            {/* Desktop navigation */}
            <nav
              aria-label="Main navigation"
              className="ml-3 hidden shrink-0 items-center gap-1 sm:flex"
            >
              <NavLink to="/" end className={navClass}>
                {t("home")}
              </NavLink>

              <NavLink
                to="/shop"
                className={navClass}
                onMouseEnter={PRELOAD["/shop"]}
                onFocus={PRELOAD["/shop"]}
              >
                {t("shop")}
              </NavLink>

              <NavLink
                to="/contact"
                className={navClass}
                onMouseEnter={PRELOAD["/contact"]}
                onFocus={PRELOAD["/contact"]}
              >
                {t("contact")}
              </NavLink>
            </nav>

            {/* Desktop smart search */}
            <NavbarSearch currentQuery={params.get("q") ?? ""} />

            {/* Language switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t("language")}
              className="ml-auto flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800 transition hover:border-brand hover:bg-green-50 sm:ml-0 sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Globe size={17} />
              <span>{language === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Account */}
            <AccountMenu />

            {/* Cart */}
            <button
              type="button"
              onClick={open}
              aria-label={`${t("cart")}, ${count}`}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:bg-brand/90 sm:h-11 sm:w-auto sm:gap-2 sm:px-5"
            >
              <ShoppingCart size={19} />

              <span className="hidden text-sm font-semibold sm:inline">
                {t("cart")}
              </span>

              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-brand sm:static">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-brand hover:bg-green-50 hover:text-brand sm:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile smart search */}
          <NavbarSearch mobile currentQuery={params.get("q") ?? ""} />

          {/* Floating mobile menu - does not change navbar height */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl shadow-black/10 sm:hidden">
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1"
              >
                <NavLink
                  to="/"
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "bg-green-50 text-brand"
                        : "text-neutral-700 hover:bg-green-50 hover:text-brand"
                    }`
                  }
                >
                  {t("home")}
                </NavLink>

                <NavLink
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "bg-green-50 text-brand"
                        : "text-neutral-700 hover:bg-green-50 hover:text-brand"
                    }`
                  }
                >
                  {t("shop")}
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "bg-green-50 text-brand"
                        : "text-neutral-700 hover:bg-green-50 hover:text-brand"
                    }`
                  }
                >
                  {t("contact")}
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 hover:bg-green-50 hover:text-brand"
                >
                  <Globe size={18} />
                  {language === "ar" ? "English" : "العربية"}
                </button>
              </nav>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
