import { Globe, Search, ShoppingCart } from "lucide-react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";

import { STORE } from "../config";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

import { AccountMenu } from "./AccountMenu";
import { Container } from "./Container";

export function Navbar() {
  const { count, open } = useCart();
  const { language, toggleLanguage, t } = useLanguage();

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();

    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "text-brand after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:rounded-full after:bg-brand"
        : "text-neutral-700 hover:text-brand"
    }`;

  return (
    <header className="relative z-50 -mb-[120px] pt-3 sm:pt-5">
      <Container>
        <div className="rounded-2xl border border-white/80 bg-white/95 px-3 py-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:rounded-full sm:px-5 lg:px-8">
          {/* Main navbar row */}
          <div className="flex min-h-11 items-center gap-2 sm:gap-3 lg:gap-5">
            {/* Logo */}
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2 text-base font-extrabold tracking-tight text-brand sm:text-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-base font-bold text-white sm:h-10 sm:w-10">
                R
              </span>

              <span>{STORE.name}</span>
            </Link>

            {/* Navigation */}
            <nav
              aria-label="Main navigation"
              className="ml-1 flex shrink-0 items-center gap-0.5 sm:ml-2 sm:gap-2"
            >
              <NavLink to="/" end className={navClass}>
                {t("home")}
              </NavLink>

              <NavLink to="/shop" className={navClass}>
                {t("shop")}
              </NavLink>
            </nav>

            {/* Desktop search */}
            <form
              onSubmit={onSearch}
              role="search"
              className="ml-auto hidden h-11 min-w-0 max-w-[560px] flex-1 items-center gap-3 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 transition focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10 sm:flex"
            >
              <Search size={19} className="shrink-0 text-neutral-500" />

              <input
                key={`${language}-${params.get("q") ?? ""}`}
                name="q"
                defaultValue={params.get("q") ?? ""}
                placeholder={t("search")}
                className="w-full min-w-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </form>

            {/* Language switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Change language"
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
          </div>

          {/* Mobile search */}
          <form
            onSubmit={onSearch}
            role="search"
            className="mt-3 flex h-10 w-full items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 transition focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10 sm:hidden"
          >
            <Search size={17} className="shrink-0 text-neutral-500" />

            <input
              key={`mobile-${language}-${params.get("q") ?? ""}`}
              name="q"
              defaultValue={params.get("q") ?? ""}
              placeholder={t("search")}
              className="w-full min-w-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </form>
        </div>
      </Container>
    </header>
  );
}
