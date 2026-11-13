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
  Wallet,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { Modal } from "../../components/admin/Modal";
import { OrderDetails } from "../../components/admin/OrderDetails";
import { Message } from "../../components/Message";
import { Skeleton, TableSkeleton } from "../../components/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { useAdminCustomer } from "../../hooks/useAdmin";
import type { Order, OrderStatus } from "../../types/order";
import { ORDER_STATUSES, STATUS_STYLE, statusKey } from "../../utils/orderStatus";

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-edge bg-white p-4 shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 text-xl font-extrabold leading-tight text-forest-2">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <div className="break-words text-sm font-semibold text-ink">{children}</div>
      </div>
    </div>
  );
}

// The admin page for one user: who they are, how much they ordered, and every order they placed.
export function AdminCustomerPage() {
  const { id } = useParams();
  const userId = Number(id);
  const { t, money, date } = useLanguage();
  const { data: user, isLoading, isError } = useAdminCustomer(userId);

  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [viewing, setViewing] = useState<Order | null>(null);

  const back = (
    <Link to="/admin/users" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand">
      <ArrowLeft size={16} className="rtl:rotate-180" />
      {t("admin.ud.back")}
    </Link>
  );

  if (isLoading) {
    return (
      <>
        {back}
        <Skeleton className="mb-5 h-44 w-full rounded-2xl bg-[#DCEAE1]" />
        <TableSkeleton />
      </>
    );
  }

  if (isError || !user) {
    return (
      <>
        {back}
        <Message title={t("admin.ud.notFound")} text={t("admin.ud.notFoundText")} />
      </>
    );
  }

  const { stats, orders } = user;
  const shown = filter === "ALL" ? orders : orders.filter((order) => order.status === filter);
  const countOf = (status: OrderStatus | "ALL") => (status === "ALL" ? orders.length : orders.filter((o) => o.status === status).length);
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {back}

      {/* Profile */}
      <section className="overflow-hidden rounded-2xl border border-edge bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-forest via-forest-2 to-[#0B5A2A] px-6 py-6 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -end-10 -top-16 h-44 w-44 rounded-full bg-emerald/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald/15 text-2xl font-extrabold text-emerald ring-1 ring-emerald/30">{initial}</span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold">{user.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                <CalendarDays size={14} />
                {t("admin.ud.memberSince", { date: date(user.createdAt) })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.emailVerified ? "bg-emerald/20 text-emerald" : "bg-amber-400/20 text-amber-200"}`}>
              {user.emailVerified ? t("admin.users.verified") : t("admin.users.notVerified")}
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={<Mail size={17} />} label={t("email")}>
            <a href={`mailto:${user.email}`} dir="ltr" className="hover:underline">{user.email}</a>
          </InfoRow>
          <InfoRow icon={<Phone size={17} />} label={t("phone")}>
            {user.phone ? <a href={`tel:${user.phone}`} dir="ltr" className="hover:underline">{user.phone}</a> : <span className="text-muted">{t("admin.users.notSet")}</span>}
          </InfoRow>
          <InfoRow icon={<MapPin size={17} />} label={t("address")}>{user.address}</InfoRow>
        </div>
      </section>

      {/* Numbers */}
      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<ShoppingBag size={19} />} label={t("admin.ud.stat.total")} value={String(stats.totalOrders)} tone="bg-[#EAF6EE] text-brand" />
        <StatCard icon={<Wallet size={19} />} label={t("admin.ud.stat.spent")} value={money(stats.totalSpent)} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={<TrendingUp size={19} />} label={t("admin.ud.stat.average")} value={money(stats.averageOrder)} tone="bg-violet-50 text-violet-600" />
        <StatCard
          icon={<Clock size={19} />}
          label={t("admin.ud.stat.last")}
          value={stats.lastOrderAt ? date(stats.lastOrderAt) : t("admin.ud.noOrdersYet")}
          tone="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="mt-3 grid grid-cols-3 gap-4">
        <StatCard icon={<Clock size={19} />} label={t("status.PENDING")} value={String(stats.pending)} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={<Truck size={19} />} label={t("status.ON_THE_WAY")} value={String(stats.onTheWay)} tone="bg-cyan-50 text-cyan-600" />
        <StatCard icon={<CheckCircle2 size={19} />} label={t("status.DELIVERED")} value={String(stats.delivered)} tone="bg-green-50 text-green-600" />
      </section>
      {stats.cancelled > 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-600">
          <XCircle size={14} />
          {t("status.CANCELLED")}: {stats.cancelled}
        </p>
      )}

      {/* History */}
      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-forest-2">{t("admin.ud.history")}</h2>
            <p className="text-sm text-muted">{t("admin.orders.count", { count: orders.length })}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", ...ORDER_STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  filter === status ? "border-brand bg-brand text-white" : "border-edge bg-white text-muted hover:border-brand hover:text-brand"
                }`}
              >
                {status === "ALL" ? t("all") : t(statusKey(status))} · {countOf(status)}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <Message title={t("admin.ud.noOrdersYet")} text={t("admin.ud.historyEmpty")} />
        ) : shown.length === 0 ? (
          <Message title={t("admin.orders.none")} text={t("admin.ud.historyFilterEmpty")} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-start text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 text-start">{t("admin.orders.colOrder")}</th>
                  <th className="px-4 py-3 text-start">{t("admin.ud.colDate")}</th>
                  <th className="px-4 py-3 text-start">{t("admin.ud.colItems")}</th>
                  <th className="px-4 py-3 text-start">{t("admin.orders.colCity")}</th>
                  <th className="px-4 py-3 text-start">{t("admin.orders.colTotal")}</th>
                  <th className="px-4 py-3 text-start">{t("admin.orders.colStatus")}</th>
                  <th className="px-4 py-3 text-end">{t("admin.ud.view")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {shown.map((order) => (
                  <tr key={order.id} onClick={() => setViewing(order)} className="cursor-pointer transition hover:bg-surface/70">
                    <td className="px-4 py-3 font-bold text-forest-2">#{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{date(order.createdAt)}</td>
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate">{order.items.slice(0, 2).map((item) => item.productName).join(", ")}</p>
                      {order.items.length > 2 && <p className="text-xs text-muted">{t("admin.ud.moreItems", { count: order.items.length - 2 })}</p>}
                    </td>
                    <td className="px-4 py-3">{order.city}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold">{money(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[order.status]}`}>{t(statusKey(order.status))}</span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); setViewing(order); }}
                        aria-label={t("admin.orders.viewOrder", { id: order.id })}
                        className="grid h-9 w-9 place-items-center rounded-lg text-brand hover:bg-[#EAF6EE]"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {viewing && (
        <Modal title={t("orders.orderNumber", { id: viewing.id })} onClose={() => setViewing(null)} size="lg">
          <OrderDetails order={viewing} />
        </Modal>
      )}
    </>
  );
}
