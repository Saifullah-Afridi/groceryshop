import { ClipboardList, Globe, LayoutDashboard, LogOut, Package, Store, Tags, Truck, Users } from "lucide-react";
import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { STORE } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { useLanguage, type TranslationKey } from "../../context/LanguageContext";
import { AdminFallback } from "../RouteFallbacks";

const LINKS: { to: string; key: TranslationKey; icon: typeof Package; end: boolean }[] = [
  { to: "/admin", key: "admin.nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", key: "admin.nav.categories", icon: Tags, end: false },
  { to: "/admin/products", key: "admin.nav.products", icon: Package, end: false },
  { to: "/admin/delivery", key: "admin.nav.delivery", icon: Truck, end: false },
  { to: "/admin/users", key: "admin.nav.users", icon: Users, end: false },
  { to: "/admin/orders", key: "admin.nav.orders", icon: ClipboardList, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-emerald/15 text-emerald ring-1 ring-emerald/25"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-emerald/15 text-emerald" : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const sideButton =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white";

// Wraps every admin page. Dark green sidebar (same greens as the shop hero and footer) on desktop,
// a top menu on mobile, and the soft mint page background of the storefront for the content.
export function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, toggleLanguage } = useLanguage();

  return (
    // The sidebar sits at the start of the page: left in English, right in Arabic (the <html dir> flips it).
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
            <span className="block text-lg font-extrabold tracking-tight">{STORE.name}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald">{t("admin.badge")}</span>
          </span>
        </Link>

        <nav className="relative flex flex-col gap-1" aria-label={t("admin.navLabel")}>
          {LINKS.map(({ to, key, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} /> {t(key)}
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
          <p className="truncate px-3 pt-2 text-xs text-white/45" dir="ltr">
            {user?.email}
          </p>
        </div>
      </aside>

      <nav
        className="flex items-center gap-1 overflow-x-auto bg-gradient-to-r from-forest to-forest-2 px-3 py-2 lg:hidden"
        aria-label={t("admin.navLabel")}
      >
        {LINKS.map(({ to, key, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
            {t(key)}
          </NavLink>
        ))}
        <button onClick={toggleLanguage} className="whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white">
          {t("admin.switchLang")}
        </button>
        <Link to="/" className="ms-auto whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white">
          {t("admin.store")}
        </Link>
        <button onClick={logout} className="whitespace-nowrap px-3 text-sm font-semibold text-white/70 hover:text-white">
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
