import { Eye, Search } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { inputClass } from "../../components/admin/FormField";
import { Modal } from "../../components/admin/Modal";
import { OrderDetails } from "../../components/admin/OrderDetails";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import { useAdminOrders, useSetOrderStatus } from "../../hooks/useAdmin";
import type { Order, OrderStatus } from "../../types/order";
import { ORDER_STATUSES, STATUS_STYLE, statusKey } from "../../utils/orderStatus";

export function AdminOrdersPage() {
  const { t, money, date } = useLanguage();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading } = useAdminOrders({ status: status || undefined, q: search.trim() || undefined });
  const setOrderStatus = useSetOrderStatus();
  const [viewing, setViewing] = useState<Order | null>(null);

  return (
    <>
      <PageHeader title={t("admin.orders.title")} text={t("admin.orders.text")} />

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute start-3 top-3 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.orders.search")} className={`${inputClass} ps-9`} />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")} className={`${inputClass} w-auto`} aria-label={t("admin.orders.filterStatus")}>
          <option value="">{t("admin.orders.allStatuses")}</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(statusKey(s))}</option>)}
        </select>
        <span className="self-center text-sm text-muted">{t("admin.orders.count", { count: orders.length })}</span>
      </div>

      {isLoading && <TableSkeleton />}
      {!isLoading && orders.length === 0 && <Message title={t("admin.orders.none")} text={t("admin.orders.noneText")} />}
      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-start text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr><th className="px-4 py-3 text-start">{t("admin.orders.colOrder")}</th><th className="px-4 py-3 text-start">{t("admin.orders.colUser")}</th><th className="px-4 py-3 text-start">{t("admin.orders.colCity")}</th><th className="px-4 py-3 text-start">{t("admin.orders.colTotal")}</th><th className="px-4 py-3 text-start">{t("admin.orders.colStatus")}</th><th className="px-4 py-3 text-end">{t("admin.orders.colView")}</th></tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3"><p className="font-semibold">#{o.id}</p><p className="text-xs text-muted">{date(o.createdAt)}</p></td>
                  <td className="px-4 py-3"><p className="font-medium">{o.name}</p><p className="text-xs text-muted">{o.phone}</p></td>
                  <td className="px-4 py-3">{o.city}</td>
                  <td className="px-4 py-3 font-semibold">{money(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={setOrderStatus.isPending}
                      onChange={(e) => setOrderStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                      aria-label={t("admin.orders.statusOf", { id: o.id })}
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(statusKey(s))}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button onClick={() => setViewing(o)} aria-label={t("admin.orders.viewOrder", { id: o.id })} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <Modal title={t("orders.orderNumber", { id: viewing.id })} onClose={() => setViewing(null)}>
          <OrderDetails order={orders.find((o) => o.id === viewing.id) ?? viewing} />
        </Modal>
      )}
    </>
  );
}
