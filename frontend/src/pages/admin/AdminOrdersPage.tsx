import { Eye, Search } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { inputClass } from "../../components/admin/FormField";
import { Modal } from "../../components/admin/Modal";
import { OrderDetails } from "../../components/admin/OrderDetails";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useAdminOrders, useSetOrderStatus } from "../../hooks/useAdmin";
import type { Order, OrderStatus } from "../../types/order";
import { formatDate, formatPrice } from "../../utils/format";
import { ORDER_STATUSES, STATUS_LABEL, STATUS_STYLE } from "../../utils/orderStatus";

export function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading } = useAdminOrders({ status: status || undefined, q: search.trim() || undefined });
  const setOrderStatus = useSetOrderStatus();
  const [viewing, setViewing] = useState<Order | null>(null);

  return (
    <>
      <PageHeader title="Orders" text="New orders appear here automatically. Change the status as you prepare and deliver them." />

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number, name, phone or city" className={`${inputClass} pl-9`} />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")} className={`${inputClass} w-auto`} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <span className="self-center text-sm text-muted">{orders.length} orders</span>
      </div>

      {isLoading && <TableSkeleton />}
      {!isLoading && orders.length === 0 && <Message title="No orders found" text="Orders placed by shoppers will show up here." />}
      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-card text-xs text-muted">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">User</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">View</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3"><p className="font-semibold">#{o.id}</p><p className="text-xs text-muted">{formatDate(o.createdAt)}</p></td>
                  <td className="px-4 py-3"><p className="font-medium">{o.name}</p><p className="text-xs text-muted">{o.phone}</p></td>
                  <td className="px-4 py-3">{o.city}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)} JOD</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={setOrderStatus.isPending}
                      onChange={(e) => setOrderStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                      aria-label={`Status of order ${o.id}`}
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(o)} aria-label={`View order ${o.id}`} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-card"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <Modal title={`Order #${viewing.id}`} onClose={() => setViewing(null)}>
          <OrderDetails order={orders.find((o) => o.id === viewing.id) ?? viewing} />
        </Modal>
      )}
    </>
  );
}
