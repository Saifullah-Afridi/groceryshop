import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Printer,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { Unit } from "../../types";
import type { Order, OrderStatus } from "../../types/order";

import { useLanguage } from "../../context/LanguageContext";
import { amountLabel } from "../../utils/format";
import { STATUS_STYLE, statusKey } from "../../utils/orderStatus";

/**
 * The only statuses the admin works with.
 * ⚠️ Make sure these strings match your OrderStatus type.
 */
export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
];

const FLOW: OrderStatus[] = ["PENDING", "ON_THE_WAY", "DELIVERED"];

interface OrderDrawerProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  isUpdating?: boolean;
}

export function OrderDrawer({
  order,
  onClose,
  onStatusChange,
  isUpdating = false,
}: OrderDrawerProps) {
  const { t, money, unitName, date, isArabic } = useLanguage();

  const isCancelled = order.status === "CANCELLED";
  const currentStep = FLOW.indexOf(order.status);
  const canCancel = order.status === "PENDING" || order.status === "ON_THE_WAY";

  // Close on Escape + lock page scroll while the drawer is open
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleCancel = () => {
    const message = isArabic
      ? `هل تريد إلغاء الطلب #${order.id}؟`
      : `Cancel order #${order.id}?`;

    if (window.confirm(message)) {
      onStatusChange(order.id, "CANCELLED");
    }
  };

  const stepLabels: Record<string, string> = {
    PENDING: isArabic ? "تم الطلب" : "Order Placed",
    ON_THE_WAY: t(statusKey("ON_THE_WAY")),
    DELIVERED: t(statusKey("DELIVERED")),
  };

  return (
    <>
      <style>{`
        @keyframes drawer-in {
          from { transform: translateX(var(--drawer-from)); }
          to   { transform: translateX(0); }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* Print only the receipt */
        @media print {
          body * { visibility: hidden !important; }
          #order-receipt, #order-receipt * { visibility: visible !important; }
          #order-receipt {
            position: absolute; left: 0; top: 0;
            width: 100%; display: block !important;
          }
          @page { margin: 8mm; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/30"
        style={{ animation: "fade-in 150ms ease-out" }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("orders.orderNumber", { id: order.id })}
        dir={isArabic ? "rtl" : "ltr"}
        className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
        style={
          {
            "--drawer-from": isArabic ? "-100%" : "100%",
            animation: "drawer-in 220ms ease-out",
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <div className="flex items-center gap-2.5 text-base font-semibold text-brand">
            <Package size={20} />
            {isArabic ? "تفاصيل الطلب" : "Order Details"}
          </div>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label={isArabic ? "إغلاق" : "Close"}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
          {/* Order number, date, status + tracker */}
          <section className="rounded-xl bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-brand">#{order.id}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {date(order.createdAt)}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
              >
                {t(statusKey(order.status))}
              </span>
            </div>

            {isCancelled ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                <XCircle size={16} />
                {isArabic ? "تم إلغاء هذا الطلب" : "This order was cancelled"}
              </div>
            ) : (
              <ol className="relative mt-5 flex justify-between">
                {/* base line */}
                <div className="absolute inset-x-6 top-[7px] h-0.5 bg-edge" />
                {/* progress line */}
                <div
                  className="absolute start-6 top-[7px] h-0.5 bg-brand transition-all"
                  style={{
                    width: `calc((100% - 3rem) * ${Math.max(currentStep, 0) / (FLOW.length - 1)})`,
                  }}
                />

                {FLOW.map((step, index) => {
                  const done = index <= currentStep;

                  return (
                    <li
                      key={step}
                      className="relative z-10 flex w-20 flex-col items-center gap-1.5 text-center"
                    >
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          done
                            ? "border-brand bg-brand"
                            : "border-edge bg-white"
                        }`}
                      />
                      <span
                        className={`text-[11px] leading-tight ${
                          done ? "font-semibold text-brand" : "text-muted"
                        }`}
                      >
                        {stepLabels[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Customer */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-brand">
              {isArabic ? "معلومات العميل" : "Customer Information"}
            </h3>

            <div className="space-y-2 text-gray-700">
              <p className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-xs font-semibold text-brand">
                  {order.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
                {order.name}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={15} className="text-muted" />
                <a
                  href={`tel:${order.phone}`}
                  dir="ltr"
                  className="hover:underline"
                >
                  {order.phone}
                </a>
              </p>

              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-muted" />
                <span>
                  {[isArabic ? (order.addressAr || order.address) : order.address, order.city].filter(Boolean).join(", ")}
                </span>
              </p>
            </div>

            {(isArabic ? (order.noteAr || order.note) : order.note) && (
              <p className="mt-3 rounded-lg border border-edge bg-white px-3 py-2 text-xs italic text-gray-600">
                {t("admin.od.note", { note: isArabic ? (order.noteAr || order.note) : order.note })}
              </p>
            )}
          </section>

          {/* Items */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-brand">
              {isArabic ? "المنتجات" : "Order Items"}
            </h3>

            <ul className="divide-y divide-edge rounded-xl border border-edge">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-gray-800">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {amountLabel(
                        item.quantity,
                        item.unit as Unit,
                        unitName(item.unit),
                      )}
                    </p>
                  </div>

                  <span className="shrink-0 font-semibold text-gray-900">
                    {money(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-1.5 px-1 text-gray-600">
              <div className="flex justify-between">
                <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-medium">{money(order.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>{isArabic ? "رسوم التوصيل" : "Delivery Fee"}</span>
                <span className="font-medium">{money(order.deliveryFee)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-base font-bold text-brand">
              <span>{t("admin.orders.colTotal")}</span>
              <span>{money(order.total)}</span>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="space-y-2.5 border-t border-edge bg-white px-5 py-4">
          <p className="text-xs font-semibold text-muted">
            {isArabic ? "إجراءات سريعة" : "Quick Actions"}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {order.status === "PENDING" && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange(order.id, "ON_THE_WAY")}
                className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Truck size={16} />
                {isArabic ? "تحديد: في الطريق" : "Mark On the Way"}
              </button>
            )}

            {order.status === "ON_THE_WAY" && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange(order.id, "DELIVERED")}
                className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {isArabic ? "تحديد: تم التوصيل" : "Mark Delivered"}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleCancel}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={16} />
                {isArabic ? "إلغاء الطلب" : "Cancel Order"}
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-edge bg-white py-2.5 text-sm font-semibold text-brand transition hover:bg-surface ${
                canCancel ? "" : "col-span-2"
              }`}
            >
              <Printer size={16} />
              {isArabic ? "طباعة الإيصال" : "Print Receipt"}
            </button>
          </div>
        </div>
      </aside>

      {/* Receipt: hidden on screen, the only thing visible when printing */}
      {createPortal(
        <div
          id="order-receipt"
          dir={isArabic ? "rtl" : "ltr"}
          style={{
            display: "none",
            maxWidth: "80mm",
            margin: "0 auto",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#000",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Rakan</div>
            <div>
              {isArabic ? "طلب" : "Order"} #{order.id}
            </div>
            <div>{date(order.createdAt)}</div>
          </div>

          <hr style={{ border: 0, borderTop: "1px dashed #000" }} />

          <div style={{ margin: "6px 0" }}>
            <div>{order.name}</div>
            <div dir="ltr" style={{ textAlign: isArabic ? "right" : "left" }}>
              {order.phone}
            </div>
            <div>{[isArabic ? (order.addressAr || order.address) : order.address, order.city].filter(Boolean).join(", ")}</div>
          </div>

          <hr style={{ border: 0, borderTop: "1px dashed #000" }} />

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "6px 0",
            }}
          >
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "2px 0" }}>
                    {item.productName}
                    <div style={{ fontSize: 11 }}>
                      {amountLabel(
                        item.quantity,
                        item.unit as Unit,
                        unitName(item.unit),
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "end",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {money(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ border: 0, borderTop: "1px dashed #000" }} />

          <div style={{ margin: "6px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isArabic ? "رسوم التوصيل" : "Delivery Fee"}</span>
              <span>{money(order.deliveryFee)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              <span>{t("admin.orders.colTotal")}</span>
              <span>{money(order.total)}</span>
            </div>
          </div>

          {(isArabic ? (order.noteAr || order.note) : order.note) && (
            <div style={{ marginTop: 6 }}>
              {t("admin.od.note", { note: isArabic ? (order.noteAr || order.note) : order.note })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 12 }}>
            {isArabic ? "شكراً لطلبكم!" : "Thank you for your order!"}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
