import {
  AlertCircle,
  AlertTriangle,
  ClipboardList,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
  Truck,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { STORE } from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  useLanguage,
  type TranslationKey,
} from "../../context/LanguageContext";
import { useAdminProducts } from "../../hooks/useAdmin";
import { AdminFallback } from "../RouteFallbacks";
import { NotificationBell } from "../NotificationBell";

type AdminLink = {
  to: string;
  key: TranslationKey;
  icon: typeof Package;
  end: boolean;
  count?: "out" | "low";
};

const LINKS: AdminLink[] = [
  {
    to: "/admin",
    key: "admin.nav.dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/orders",
    key: "admin.nav.orders",
    icon: ClipboardList,
    end: false,
  },
  {
    to: "/admin/products",
    key: "admin.nav.products",
    icon: Package,
    end: false,
  },
  {
    to: "/admin/out-of-stock",
    key: "admin.nav.outOfStock",
    icon: AlertCircle,
    end: false,
    count: "out",
  },
  {
    to: "/admin/low-stock",
    key: "admin.nav.lowStock",
    icon: AlertTriangle,
    end: false,
    count: "low",
  },
  {
    to: "/admin/categories",
    key: "admin.nav.categories",
    icon: Tags,
    end: false,
  },
  { to: "/admin/delivery", key: "admin.nav.delivery", icon: Truck, end: false },
  { to: "/admin/users", key: "admin.nav.users", icon: Users, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-emerald/15 text-emerald ring-1 ring-emerald/25"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-emerald/15 text-emerald"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const sideButton =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white";

function StockCount({
  kind,
  count,
}: {
  kind: "out" | "low";
  count: number | undefined;
}) {
  return (
    <span
      className={`ms-auto min-w-6 rounded-full px-2 py-0.5 text-center text-[11px] font-bold ${kind === "out" ? "bg-red-500/20 text-red-200" : "bg-amber-400/20 text-amber-200"}`}
    >
      {count ?? "—"}
    </span>
  );
}

export function AdminLayout() {
  const { logout } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  // These use the same paginated API as the stock pages; pagination.total is the full count.
  // Refresh periodically so counts also reflect inventory changes caused by customer orders.
  const { data: outOfStockData } = useAdminProducts(
    { page: 1, limit: 1, stock: "out", archived: false },
    30_000,
  );
  const { data: lowStockData } = useAdminProducts(
    { page: 1, limit: 1, stock: "low", archived: false },
    30_000,
  );

  return (
    <div className="min-h-screen bg-surface lg:ps-64">
      <aside className="fixed inset-y-0 start-0 hidden w-64 flex-col overflow-hidden bg-gradient-to-b from-forest via-forest-2 to-forest-2 p-5 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-emerald/10 blur-3xl"
        />
        <Link to="/admin" className="relative mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-base font-extrabold text-white shadow-lg shadow-black/20">
            R
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">
              {STORE.name}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald">
              {t("admin.badge")}
            </span>
          </span>
        </Link>

        <nav
          className="relative flex flex-col gap-1"
          aria-label={t("admin.navLabel")}
        >
          {LINKS.map(({ to, key, icon: Icon, end, count }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} />
              <span className="min-w-0 flex-1">{t(key)}</span>
              {count === "out" && (
                <StockCount
                  kind="out"
                  count={outOfStockData?.pagination.total}
                />
              )}
              {count === "low" && (
                <StockCount kind="low" count={lowStockData?.pagination.total} />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative mt-auto space-y-1 border-t border-white/10 pt-4">
          <button onClick={toggleLanguage} className={sideButton}>
            <Globe size={18} /> {t("admin.switchLang")}
          </button>
          <Link to="/" className={sideButton}>
            <Store size={18} /> {t("admin.viewStore")}
          </Link>
          <button onClick={logout} className={sideButton}>
            <LogOut size={18} /> {t("signOut")}
          </button>
        </div>
      </aside>

      <header className="flex min-h-16 items-center justify-between bg-[#24594e] px-4 py-3 text-white shadow-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-extrabold">
            R
          </span>
          <span className="font-bold">{STORE.name}</span>
        </div>
        <div className="hidden text-sm font-semibold text-white/80 lg:block">
          {t("admin.badge")}
        </div>
        <div className="ms-auto">
          <NotificationBell audience="admin" />
        </div>
      </header>

      <nav
        className="flex items-center gap-1 overflow-x-auto bg-gradient-to-r from-forest to-forest-2 px-3 py-2 lg:hidden"
        aria-label={t("admin.navLabel")}
      >
        {LINKS.map(({ to, key, end, count }) => (
          <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
            <span className="inline-flex items-center gap-1.5">
              {t(key)}
              {count === "out" && (
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-200">
                  {outOfStockData?.pagination.total ?? "—"}
                </span>
              )}
              {count === "low" && (
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-200">
                  {lowStockData?.pagination.total ?? "—"}
                </span>
              )}
            </span>
          </NavLink>
        ))}
        <button
          onClick={toggleLanguage}
          className="whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white"
        >
          {t("admin.switchLang")}
        </button>
        <Link
          to="/"
          className="ms-auto whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white"
        >
          {t("admin.store")}
        </Link>
        <button
          onClick={logout}
          className="whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white"
        >
          {t("signOut")}
        </button>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<AdminFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
