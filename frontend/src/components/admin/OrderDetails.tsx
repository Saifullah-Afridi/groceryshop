import type { Unit } from "../../types";
import type { Order } from "../../types/order";
import { useLanguage } from "../../context/LanguageContext";
import { amountLabel } from "../../utils/format";
import { STATUS_STYLE, statusKey } from "../../utils/orderStatus";

// The inside of the "view order" window.
export function OrderDetails({ order }: { order: Order }) {
  const { t, money, unitName, date } = useLanguage();
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted">{date(order.createdAt)}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{t(statusKey(order.status))}</span>
      </div>

      <div className="rounded-xl bg-surface p-4">
        <p className="font-semibold">{order.name}</p>
        <p className="text-muted"><a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a></p>
        <p className="mt-1">{order.address}, {order.city}</p>
        {order.note && <p className="mt-2 italic text-muted">{t("admin.od.note", { note: order.note })}</p>}
      </div>

      <table className="w-full text-start">
        <thead className="text-xs text-muted">
          <tr><th className="pb-2 text-start">{t("admin.od.product")}</th><th className="pb-2 text-start">{t("admin.od.quantity")}</th><th className="pb-2 text-end">{t("admin.od.total")}</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">{item.productName}</td>
              <td className="py-2">{amountLabel(item.quantity, item.unit as Unit, unitName(item.unit))}</td>
              <td className="py-2 text-end font-medium">{money(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-line pt-3 text-end">
        <p className="text-muted">{t("orders.subtotalLine", { amount: order.subtotal.toFixed(2), currency: t("currency") })}</p>
        <p className="text-muted">{t("admin.od.deliveryTo", { city: order.city, amount: order.deliveryFee.toFixed(2), currency: t("currency") })}</p>
        <p className="text-base font-bold">{t("orders.totalLine", { amount: order.total.toFixed(2), currency: t("currency") })}</p>
      </div>
    </div>
  );
}
