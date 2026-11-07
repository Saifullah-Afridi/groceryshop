import type { Unit } from "../../types";
import type { Order } from "../../types/order";
import { amountLabel, formatDate, formatPrice } from "../../utils/format";
import { STATUS_LABEL, STATUS_STYLE } from "../../utils/orderStatus";

// The inside of the "view order" window.
export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted">{formatDate(order.createdAt)}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
      </div>

      <div className="rounded-xl bg-card p-4">
        <p className="font-semibold">{order.name}</p>
        <p className="text-muted"><a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a></p>
        <p className="mt-1">{order.address}, {order.city}</p>
        {order.note && <p className="mt-2 italic text-muted">Note: {order.note}</p>}
      </div>

      <table className="w-full text-left">
        <thead className="text-xs text-muted">
          <tr><th className="pb-2">Product</th><th className="pb-2">Quantity</th><th className="pb-2 text-right">Total</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">{item.productName}</td>
              <td className="py-2">{amountLabel(item.quantity, item.unit as Unit)}</td>
              <td className="py-2 text-right font-medium">{formatPrice(item.lineTotal)} JOD</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-line pt-3 text-right">
        <p className="text-muted">Subtotal {formatPrice(order.subtotal)} JOD</p>
        <p className="text-muted">Delivery to {order.city} {formatPrice(order.deliveryFee)} JOD</p>
        <p className="text-base font-bold">Total {formatPrice(order.total)} JOD</p>
      </div>
    </div>
  );
}
