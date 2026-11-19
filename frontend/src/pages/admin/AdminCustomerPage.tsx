import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  TrendingUp,
  Truck,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";

import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { Modal } from "../../components/admin/Modal";
import { OrderDetails } from "../../components/admin/OrderDetails";
import { Pagination } from "../../components/admin/Pagination";
import { Message } from "../../components/Message";
import { Skeleton, TableSkeleton } from "../../components/Skeleton";

import { useLanguage } from "../../context/LanguageContext";
import { useAdminCustomer } from "../../hooks/useAdmin";

import type { Order, OrderStatus } from "../../types/order";

import {
  ORDER_STATUSES,
  STATUS_STYLE,
  statusKey,
} from "../../utils/orderStatus";

const PAGE_SIZE = 8;

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      className="
        rounded-xl border border-edge bg-white px-4 py-4
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            grid h-10 w-10 shrink-0 place-items-center
            rounded-lg ${tone}
          `}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight text-brand">
            {value}
          </p>

          <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="
          grid h-9 w-9 shrink-0 place-items-center
          rounded-lg border border-edge
          bg-surface text-brand
        "
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>

        <div className="mt-1 break-words text-sm font-medium text-brand">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AdminCustomerPage() {
  const { id } = useParams();
  const userId = Number(id);

  const { t, money, date, isArabic } = useLanguage();

  const { data: user, isLoading, isError } = useAdminCustomer(userId);

  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Keep all hooks before conditional returns.
  const orders = user?.orders ?? [];

  const shown =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  const countOf = (status: OrderStatus | "ALL") =>
    status === "ALL"
      ? orders.length
      : orders.filter((order) => order.status === status).length;

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));

  const paginatedOrders = shown.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (status: OrderStatus | "ALL") => {
    setFilter(status);
    setCurrentPage(1);
  };

  const back = (
    <Link
      to="/admin/users"
      className="
        mb-5 inline-flex items-center gap-2
        text-sm font-semibold text-muted
        transition-colors duration-200
        hover:text-brand
      "
    >
      <ArrowLeft size={16} className={isArabic ? "rotate-180" : ""} />
      {t("admin.ud.back")}
    </Link>
  );

  if (isLoading) {
    return (
      <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
        {back}

        <Skeleton className="h-36 w-full rounded-xl bg-[#DCEAE1]" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>

        <TableSkeleton />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
        {back}

        <div className="rounded-xl border border-edge bg-white p-6">
          <Message
            title={t("admin.ud.notFound")}
            text={t("admin.ud.notFoundText")}
          />
        </div>
      </div>
    );
  }

  const { stats } = user;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      {back}

      {/* Customer information */}
      <section className="overflow-hidden rounded-xl border border-edge bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-xl border border-edge
                bg-surface text-brand
              "
            >
              <UserRound size={21} />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-brand">
                {user.name}
              </h1>

              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays size={13} />
                {t("admin.ud.memberSince", {
                  date: date(user.createdAt),
                })}
              </p>
            </div>
          </div>

          <span
            className={`
              inline-flex shrink-0 items-center gap-1.5
              rounded-full px-3 py-1.5
              text-xs font-semibold
              ${
                user.emailVerified
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }
            `}
          >
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${user.emailVerified ? "bg-green-600" : "bg-amber-500"}
              `}
            />

            {user.emailVerified
              ? t("admin.users.verified")
              : t("admin.users.notVerified")}
          </span>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={<Mail size={17} />} label={t("email")}>
            <a
              href={`mailto:${user.email}`}
              dir="ltr"
              className="inline-block transition-colors hover:text-brand-dark hover:underline"
            >
              {user.email}
            </a>
          </InfoItem>

          <InfoItem icon={<Phone size={17} />} label={t("phone")}>
            {user.phone ? (
              <a
                href={`tel:${user.phone}`}
                dir="ltr"
                className="inline-block transition-colors hover:text-brand-dark hover:underline"
              >
                {user.phone}
              </a>
            ) : (
              <span className="text-muted">{t("admin.users.notSet")}</span>
            )}
          </InfoItem>

          <InfoItem icon={<MapPin size={17} />} label={t("address")}>
            {(isArabic ? (user.addressAr || user.address) : user.address) || (
              <span className="text-muted">{t("admin.users.notSet")}</span>
            )}
          </InfoItem>
        </div>
      </section>

      {/* Order statistics */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-brand">
          {t("admin.ud.history")}
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<ShoppingBag size={19} />}
            label={t("admin.ud.stat.total")}
            value={String(stats.totalOrders)}
            tone="bg-green-50 text-green-700"
          />

          <StatCard
            icon={<Wallet size={19} />}
            label={t("admin.ud.stat.spent")}
            value={money(stats.totalSpent)}
            tone="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<TrendingUp size={19} />}
            label={t("admin.ud.stat.average")}
            value={money(stats.averageOrder)}
            tone="bg-violet-50 text-violet-600"
          />

          <StatCard
            icon={<Clock size={19} />}
            label={t("admin.ud.stat.last")}
            value={
              stats.lastOrderAt
                ? date(stats.lastOrderAt)
                : t("admin.ud.noOrdersYet")
            }
            tone="bg-amber-50 text-amber-600"
          />
        </div>
      </section>

      {/* Order status statistics */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Clock size={18} />}
          label={t("status.PENDING")}
          value={String(stats.pending)}
          tone="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={<Truck size={18} />}
          label={t("status.ON_THE_WAY")}
          value={String(stats.onTheWay)}
          tone="bg-cyan-50 text-cyan-600"
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label={t("status.DELIVERED")}
          value={String(stats.delivered)}
          tone="bg-green-50 text-green-600"
        />
      </section>

      {/* Cancelled orders */}
      {stats.cancelled > 0 && (
        <div
          className="
            flex items-center gap-2 rounded-lg
            border border-red-100 bg-red-50
            px-4 py-3 text-sm font-medium text-red-600
          "
        >
          <XCircle size={16} />
          {t("status.CANCELLED")}: {stats.cancelled}
        </div>
      )}

      {/* Order history */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-brand">
            {t("admin.ud.history")}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.count", {
              count: orders.length,
            })}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...ORDER_STATUSES] as const).map((status) => {
            const active = filter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => handleFilterChange(status)}
                className={`
                  inline-flex h-9 cursor-pointer
                  items-center gap-1.5 rounded-lg
                  border px-3 text-xs font-semibold
                  transition-all duration-200
                  active:scale-95
                  focus:outline-none focus:ring-2
                  focus:ring-brand focus:ring-offset-2
                  ${
                    active
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-edge bg-white text-muted hover:border-brand hover:bg-surface hover:text-brand"
                  }
                `}
              >
                {status === "ALL" ? t("all") : t(statusKey(status))}

                <span
                  className={`
                    rounded-md px-1.5 py-0.5 text-[10px]
                    ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-surface text-muted"
                    }
                  `}
                >
                  {countOf(status)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty states */}
        {orders.length === 0 ? (
          <div className="rounded-xl border border-edge bg-white p-6">
            <Message
              title={t("admin.ud.noOrdersYet")}
              text={t("admin.ud.historyEmpty")}
            />
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl border border-edge bg-white p-6">
            <Message
              title={t("admin.orders.none")}
              text={t("admin.ud.historyFilterEmpty")}
            />
          </div>
        ) : (
          <>
            {/* Orders table */}
            <div className="overflow-hidden rounded-xl border border-edge bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colOrder")}
                      </th>

                      <th className="px-5 py-3.5 text-start">
                        {t("admin.ud.colDate")}
                      </th>

                      <th className="px-5 py-3.5 text-start">
                        {t("admin.ud.colItems")}
                      </th>

                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colCity")}
                      </th>

                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colTotal")}
                      </th>

                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colStatus")}
                      </th>

                      <th className="px-5 py-3.5 text-end">
                        {t("admin.ud.view")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-edge">
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setViewing(order)}
                        className="
                          group cursor-pointer
                          transition-colors duration-200
                          hover:bg-surface/70
                        "
                      >
                        <td className="px-5 py-4">
                          <span className="font-semibold text-brand transition-colors group-hover:text-brand-dark">
                            #{order.id}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-muted">
                          {date(order.createdAt)}
                        </td>

                        <td className="max-w-[260px] px-5 py-4">
                          <p className="truncate font-medium text-brand">
                            {order.items
                              .slice(0, 2)
                              .map((item) => item.productName)
                              .join(", ")}
                          </p>

                          {order.items.length > 2 && (
                            <p className="mt-1 text-xs text-muted">
                              {t("admin.ud.moreItems", {
                                count: order.items.length - 2,
                              })}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-brand">{order.city}</td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-brand">
                          {money(order.total)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex whitespace-nowrap
                              rounded-full px-2.5 py-1
                              text-xs font-semibold
                              ${STATUS_STYLE[order.status]}
                            `}
                          >
                            {t(statusKey(order.status))}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setViewing(order);
                              }}
                              aria-label={t("admin.orders.viewOrder", {
                                id: order.id,
                              })}
                              className="
                                grid h-9 w-9 cursor-pointer
                                place-items-center rounded-lg
                                border border-edge bg-white
                                text-muted
                                transition-all duration-200
                                hover:border-brand
                                hover:bg-brand
                                hover:text-white
                                active:scale-95
                                focus:outline-none
                                focus:ring-2 focus:ring-brand
                                focus:ring-offset-2
                              "
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={shown.length}
              pageSize={PAGE_SIZE}
              itemLabel="orders"
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* Order details modal */}
      {viewing && (
        <Modal
          title={t("orders.orderNumber", {
            id: viewing.id,
          })}
          onClose={() => setViewing(null)}
          size="lg"
        >
          <OrderDetails order={viewing} />
        </Modal>
      )}
    </div>
  );
}
