import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArchiveX,
  ArrowUpRight,
  Banknote,
  ClipboardList,
  Package,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminDashboard } from "../../hooks/useAdmin";
import { useLanguage } from "../../context/LanguageContext";
import { formatPrice } from "../../utils/format";
import { TableSkeleton } from "../../components/Skeleton";
import { STATUS_STYLE, statusKey } from "../../utils/orderStatus";
import type { OrderStatus } from "../../types/order";

type Metric = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
};

function MetricCard({ label, value, icon: Icon, href }: Metric) {
  const content = (
    <div className="flex min-h-[112px] items-start justify-between gap-3 rounded-xl border border-[#e4e9e5] bg-white p-4 transition-colors hover:border-[#b9d5c2]">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#68766d]">{label}</p>
        <p className="mt-2 break-words text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#18251d]">
          {value}
        </p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf5ef] text-[#287247]">
        <Icon size={18} strokeWidth={1.9} />
      </span>
    </div>
  );

  return href ? (
    <Link
      to={href}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#287247] focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3 border-b border-[#edf0ed] pb-3">
      <h2 className="text-[15px] font-semibold text-[#1c2a21]">{title}</h2>
      {action}
    </div>
  );
}

function OrderStatusBadge({
  status,
  label,
}: {
  status: OrderStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${STATUS_STYLE[status]}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-9 text-center text-sm text-[#849087]">
      {children}
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();
  const { isArabic, t } = useLanguage();
  const tr = (en: string, ar: string) => (isArabic ? ar : en);
  const money = (amount: number) => `${formatPrice(amount)} JOD`;

  if (isLoading) return <TableSkeleton />;

  if (error || !data) {
    return (
      <p className="rounded-lg border border-[#efcfcc] bg-[#fff7f6] p-4 text-sm text-[#9b4038]">
        {tr(
          "Could not load dashboard data. Check the API and database migration.",
          "تعذر تحميل بيانات لوحة التحكم. تحقق من واجهة API وترحيل قاعدة البيانات.",
        )}
      </p>
    );
  }

  const primaryMetrics: Metric[] = [
    {
      label: tr("Today's revenue", "مبيعات اليوم"),
      value: money(data.todayRevenue),
      icon: Banknote,
    },
    {
      label: tr("Orders today", "طلبات اليوم"),
      value: data.todayOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: tr("Pending orders", "الطلبات المعلقة"),
      value: data.pendingOrders,
      icon: ClipboardList,
      href: "/admin/orders",
    },
    {
      label: tr("Average order value", "متوسط قيمة الطلب"),
      value: money(data.averageOrderValue),
      icon: ClipboardList,
    },
  ];

  const secondaryMetrics = [
    {
      label: tr("Revenue this month", "مبيعات هذا الشهر"),
      value: money(data.monthRevenue),
      icon: Banknote,
    },
    {
      label: tr("New customers today", "عملاء جدد اليوم"),
      value: data.newCustomersToday,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: tr("Products", "المنتجات"),
      value: data.productsCount,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: tr("Categories", "الفئات"),
      value: data.categoriesCount,
      icon: Tags,
      href: "/admin/categories",
    },
  ];

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e6ebe7] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c2a21]">
            {tr("Dashboard", "لوحة التحكم")}
          </h1>
          <p className="mt-1 text-sm text-[#748078]">
            {tr(
              "A clear overview of your store's activity.",
              "ملخص واضح لنشاط متجرك.",
            )}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dce5de] bg-white px-3.5 text-sm font-medium text-[#315d40] transition-colors hover:bg-[#f5f8f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#287247] focus-visible:ring-offset-2"
        >
          {tr("View orders", "عرض الطلبات")}
          <ArrowUpRight size={14} />
        </Link>
      </header>

      <section
        aria-label={tr("Key figures", "المؤشرات الرئيسية")}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4"
      >
        {primaryMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#e4e9e5] bg-white sm:grid-cols-4">
        {secondaryMetrics.map(({ label, value, icon: Icon, href }, index) => {
          const item = (
            <div
              className={`flex min-h-[78px] items-center gap-3 px-4 py-3 ${index > 0 ? "border-s border-[#edf0ed]" : ""}`}
            >
              <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f6f3] text-[#68776c] sm:flex">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-[#77837a]">{label}</p>
                <p className="mt-1 truncate text-[15px] font-semibold text-[#26342a]">
                  {value}
                </p>
              </div>
            </div>
          );

          return href ? (
            <Link
              key={label}
              to={href}
              className="transition-colors hover:bg-[#fafcf9]"
            >
              {item}
            </Link>
          ) : (
            <div key={label}>{item}</div>
          );
        })}
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-[#e4e9e5] bg-white">
            <div className="p-4 sm:p-5">
              <SectionHeading
                title={tr("Recent orders", "أحدث الطلبات")}
                action={
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#287247] hover:text-[#174d2e]"
                  >
                    {tr("View all", "عرض الكل")} <ArrowUpRight size={13} />
                  </Link>
                }
              />
            </div>

            {data.recentOrders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="bg-[#f7f9f7] text-[11px] font-semibold text-[#78847b]">
                      <th className="px-5 py-3 text-start">
                        {tr("Order", "الطلب")}
                      </th>
                      <th className="px-5 py-3 text-start">
                        {tr("Customer", "العميل")}
                      </th>
                      <th className="px-5 py-3 text-start">
                        {tr("Status", "الحالة")}
                      </th>
                      <th className="px-5 py-3 text-end">
                        {tr("Total", "الإجمالي")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-[#edf0ed] transition-colors hover:bg-[#fbfcfb]"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-[#26342a]">
                          #{order.id}
                        </td>
                        <td className="max-w-[190px] truncate px-5 py-3.5 text-[#59665d]">
                          {order.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <OrderStatusBadge
                            status={order.status as OrderStatus}
                            label={t(statusKey(order.status as OrderStatus))}
                          />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-end font-semibold text-[#26342a]">
                          {money(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>
                {tr("No recent orders yet.", "لا توجد طلبات حديثة حتى الآن.")}
              </EmptyState>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-[#e4e9e5] bg-white">
            <div className="p-4 sm:p-5">
              <SectionHeading
                title={tr("Best sellers this month", "الأكثر مبيعاً هذا الشهر")}
              />
            </div>
            {data.bestSellers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-sm">
                  <thead>
                    <tr className="bg-[#f7f9f7] text-[11px] font-semibold text-[#78847b]">
                      <th className="w-14 px-5 py-3 text-start">#</th>
                      <th className="px-5 py-3 text-start">
                        {tr("Product", "المنتج")}
                      </th>
                      <th className="px-5 py-3 text-end">
                        {tr("Quantity sold", "الكمية المباعة")}
                      </th>
                      <th className="px-5 py-3 text-end">
                        {tr("Revenue", "الإيرادات")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bestSellers.map((product, index) => (
                      <tr
                        key={product.name}
                        className="border-t border-[#edf0ed]"
                      >
                        <td className="px-5 py-3.5 text-[#8a958d]">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-[#344238]">
                          {product.name}
                        </td>
                        <td className="px-5 py-3.5 text-end text-[#59665d]">
                          {product.quantity}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-end font-semibold text-[#26342a]">
                          {money(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>
                {tr(
                  "No sales yet this month.",
                  "لا توجد مبيعات هذا الشهر بعد.",
                )}
              </EmptyState>
            )}
          </section>
        </div>

        <aside className="min-w-0 overflow-hidden rounded-xl border border-[#e4e9e5] bg-white">
          <div className="p-4 sm:p-5">
            <SectionHeading
              title={tr("Inventory attention", "تنبيهات المخزون")}
              action={
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-[#287247] hover:text-[#174d2e]"
                >
                  {tr("Products", "المنتجات")}
                </Link>
              }
            />

            <Link
              to="/admin/products?stock=low"
              className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#f0e2c6] bg-[#fffaf1] px-3.5 py-3 transition-colors hover:bg-[#fff6e5]"
            >
              <span className="flex items-center gap-2.5">
                <AlertTriangle size={17} className="shrink-0 text-[#a8792d]" />
                <span className="text-sm font-medium text-[#614b26]">
                  {tr("Low stock", "مخزون منخفض")}
                </span>
              </span>
              <span className="text-lg font-semibold tabular-nums text-[#614b26]">
                {data.lowStockCount}
              </span>
            </Link>

            {data.lowStock.length ? (
              <div className="mt-2 divide-y divide-[#edf0ed]">
                {data.lowStock.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate text-[#59665d]">
                      {isArabic ? product.nameAr || product.name : product.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-[#7b612f]">
                      {product.stockQuantity} {product.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-3 text-xs text-[#89948c]">
                {tr(
                  "No products need restocking.",
                  "لا توجد منتجات تحتاج إلى إعادة تخزين.",
                )}
              </p>
            )}

            <div className="my-3 border-t border-[#edf0ed]" />

            <Link
              to="/admin/products?stock=out"
              className="flex items-center justify-between gap-3 rounded-lg border border-[#efd8d5] bg-[#fff7f6] px-3.5 py-3 transition-colors hover:bg-[#fff0ee]"
            >
              <span className="flex items-center gap-2.5">
                <ArchiveX size={17} className="shrink-0 text-[#a34c43]" />
                <span className="text-sm font-medium text-[#713c37]">
                  {tr("Out of stock", "نفد المخزون")}
                </span>
              </span>
              <span className="text-lg font-semibold tabular-nums text-[#713c37]">
                {data.outOfStockCount}
              </span>
            </Link>

            {data.outOfStock.length ? (
              <div className="mt-2 divide-y divide-[#edf0ed]">
                {data.outOfStock.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="py-2.5 text-sm text-[#59665d]"
                  >
                    {isArabic ? product.nameAr || product.name : product.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-3 text-xs text-[#89948c]">
                {tr(
                  "No products are out of stock.",
                  "لا توجد منتجات نفد مخزونها.",
                )}
              </p>
            )}

            {(data.lowStockCount > data.lowStock.length || data.outOfStockCount > data.outOfStock.length) && (
              <Link
                to="/admin/products"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#287247] hover:text-[#174d2e]"
              >
                {tr("Review all inventory", "مراجعة كل المخزون")}{" "}
                <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
