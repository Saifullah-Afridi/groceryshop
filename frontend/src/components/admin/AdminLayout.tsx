// import {
//   ClipboardList,
//   Globe,
//   LayoutDashboard,
//   LogOut,
//   Package,
//   Store,
//   Tags,
//   Truck,
//   Users,
//   ShieldCheck,
// } from "lucide-react";
// import { Suspense } from "react";
// import { Link, NavLink, Outlet } from "react-router-dom";
// import { STORE } from "../../config";
// import { useAuth } from "../../context/AuthContext";
// import {
//   useLanguage,
//   type TranslationKey,
// } from "../../context/LanguageContext";
// import { AdminFallback } from "../RouteFallbacks";
// import { NotificationBell } from "../NotificationBell";

// const LINKS: {
//   to: string;
//   key: TranslationKey;
//   icon: typeof Package;
//   end: boolean;
// }[] = [
//   {
//     to: "/admin",
//     key: "admin.nav.dashboard",
//     icon: LayoutDashboard,
//     end: true,
//   },
//   {
//     to: "/admin/orders",
//     key: "admin.nav.orders",
//     icon: ClipboardList,
//     end: false,
//   },
//   {
//     to: "/admin/products",
//     key: "admin.nav.products",
//     icon: Package,
//     end: false,
//   },
//   {
//     to: "/admin/categories",
//     key: "admin.nav.categories",
//     icon: Tags,
//     end: false,
//   },
//   { to: "/admin/delivery", key: "admin.nav.delivery", icon: Truck, end: false },
//   { to: "/admin/users", key: "admin.nav.users", icon: Users, end: false },
// ];

// const linkClass = ({ isActive }: { isActive: boolean }) =>
//   `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
//     isActive
//       ? "bg-emerald/15 text-emerald ring-1 ring-emerald/25"
//       : "text-white/70 hover:bg-white/10 hover:text-white"
//   }`;

// const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
//   `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
//     isActive
//       ? "bg-emerald/15 text-emerald"
//       : "text-white/70 hover:bg-white/10 hover:text-white"
//   }`;

// const sideButton =
//   "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white";

// export function AdminLayout() {
//   const { logout } = useAuth();
//   const { t, toggleLanguage } = useLanguage();

//   return (
//     <div className="min-h-screen bg-surface lg:ps-64">
//       {/* Desktop sidebar remains in place. */}
//       <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col overflow-hidden bg-gradient-to-b from-forest via-forest-2 to-forest-2 p-5 text-white lg:flex">
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-emerald/10 blur-3xl"
//         />

//         <Link to="/admin" className="relative mb-8 flex items-center gap-3">
//           <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-base font-extrabold text-white shadow-lg shadow-black/20">
//             R
//           </span>
//           <span className="leading-tight">
//             <span className="block text-lg font-extrabold tracking-tight">
//               {STORE.name}
//             </span>
//             <span className="text-[11px] font-bold uppercase tracking-wider text-emerald">
//               {t("admin.badge")}
//             </span>
//           </span>
//         </Link>

//         <nav
//           className="relative flex flex-col gap-1"
//           aria-label={t("admin.navLabel")}
//         >
//           {LINKS.map(({ to, key, icon: Icon, end }) => (
//             <NavLink key={to} to={to} end={end} className={linkClass}>
//               <Icon size={18} /> {t(key)}
//             </NavLink>
//           ))}
//         </nav>

//         <div className="relative mt-auto space-y-1 border-t border-white/10 pt-4">
//           <button onClick={toggleLanguage} className={sideButton}>
//             <Globe size={18} /> {t("admin.switchLang")}
//           </button>
//           <Link to="/" className={sideButton}>
//             <Store size={18} /> {t("admin.viewStore")}
//           </Link>
//           <button onClick={logout} className={sideButton}>
//             <LogOut size={18} /> {t("signOut")}
//           </button>
//         </div>
//       </aside>

//       {/* Top admin header stays alongside the sidebar, not instead of it. */}
//       <div className="min-w-0">
//         <header className="sticky top-0 z-30 border-b border-white/10 bg-gradient-to-r from-forest via-forest-2 to-forest shadow-lg shadow-black/10">
//           <div className="flex min-h-[72px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
//             <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
//               <div
//                 className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
//                 title="Notifications"
//               >
//                 <NotificationBell audience="admin" />
//               </div>
//             </div>
//           </div>

//           {/* Mobile navigation; desktop navigation remains in the sidebar. */}
//           <nav
//             className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden"
//             aria-label={t("admin.navLabel")}
//           >
//             {LINKS.map(({ to, key, end }) => (
//               <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
//                 {t(key)}
//               </NavLink>
//             ))}
//           </nav>
//         </header>

//         <main className="p-4 sm:p-6 lg:p-8">
//           <Suspense fallback={<AdminFallback />}>
//             <Outlet />
//           </Suspense>
//         </main>
//       </div>
//     </div>
//   );
// }

import {
  ClipboardList,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
  Truck,
  Users,
  ShieldCheck,
} from "lucide-react";

import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { STORE } from "../../config";
import { useAuth } from "../../context/AuthContext";

import {
  useLanguage,
  type TranslationKey,
} from "../../context/LanguageContext";

import { AdminFallback } from "../RouteFallbacks";
import { NotificationBell } from "../NotificationBell";

// Admin sidebar navigation links
const LINKS: {
  to: string;
  key: TranslationKey;
  icon: typeof Package;
  end: boolean;
}[] = [
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
    to: "/admin/categories",
    key: "admin.nav.categories",
    icon: Tags,
    end: false,
  },
  {
    to: "/admin/delivery",
    key: "admin.nav.delivery",
    icon: Truck,
    end: false,
  },
  {
    to: "/admin/users",
    key: "admin.nav.users",
    icon: Users,
    end: false,
  },
];

// Desktop sidebar link styling
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-emerald/15 text-emerald ring-1 ring-emerald/25"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

// Mobile navigation styling
const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-emerald/15 text-emerald"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

// Sidebar button styling
const sideButton =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white";

export function AdminLayout() {
  const { logout } = useAuth();
  const { t, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-surface lg:ps-64">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col overflow-hidden bg-gradient-to-b from-forest via-forest-2 to-forest-2 p-5 text-white lg:flex">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-emerald/10 blur-3xl"
        />

        {/* Store Logo and Name */}
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

        {/* Sidebar Navigation */}
        <nav
          className="relative flex flex-col gap-1"
          aria-label={t("admin.navLabel")}
        >
          {LINKS.map(({ to, key, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} />
              {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="relative mt-auto space-y-1 border-t border-white/10 pt-4">
          <button onClick={toggleLanguage} className={sideButton}>
            <Globe size={18} />
            {t("admin.switchLang")}
          </button>

          <Link to="/" className={sideButton}>
            <Store size={18} />
            {t("admin.viewStore")}
          </Link>

          <button onClick={logout} className={sideButton}>
            <LogOut size={18} />
            {t("signOut")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0">
        {/* Top Admin Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#24594e] shadow-lg shadow-black/10">
          <div className="flex min-h-[60px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Left Side: Admin Heading */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />

                <span className="text-xs font-semibold text-white">
                  Store Management
                </span>
              </div>
            </div>

            {/* Right Side: Store Status and Notifications */}
            <div className="flex shrink-0 items-center gap-3">
              {/* Store Management Badge */}

              {/* Notifications */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                title="Notifications"
              >
                <NotificationBell audience="admin" />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav
            className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden"
            aria-label={t("admin.navLabel")}
          >
            {LINKS.map(({ to, key, end }) => (
              <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
                {t(key)}
              </NavLink>
            ))}
          </nav>
        </header>

        {/* Admin Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<AdminFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
