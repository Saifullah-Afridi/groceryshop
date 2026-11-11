import { useState } from "react";
import { TableSkeleton } from "../components/Skeleton";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { Container } from "../components/Container";
import { Message } from "../components/Message";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCancelMyOrder, useMyOrders } from "../hooks/useOrders";
import type { Unit } from "../types";
import type { Order, OrderStatus } from "../types/order";
import { qtyLabel } from "../utils/format";
import { STATUS_STYLE, TRACKER_STEPS, statusKey } from "../utils/orderStatus";

function Tracker({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  const current = TRACKER_STEPS.indexOf(status);
  return (
    <ol className="mt-5 grid grid-cols-5 gap-1.5 text-center text-[11px]">
      {TRACKER_STEPS.map((step, index) => (
        <li key={step}>
          <div className={`h-1.5 rounded-full ${index <= current ? "bg-[#078A4B]" : "bg-line"}`} />
          <span className={`mt-1.5 block ${index <= current ? "font-semibold text-[#078A4B]" : "text-muted"}`}>{t(statusKey(step))}</span>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const { t, money, unitName, date } = useLanguage();
  return (
    <article className="rounded-2xl border border-[#DCEAE1] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-extrabold text-[#123B2A]">{t("orders.orderNumber", { id: order.id })}</h2>
          <p className="text-xs text-muted">{date(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{t(statusKey(order.status))}</span>
      </div>

      {order.status !== "CANCELLED" && <Tracker status={order.status} />}

      <ul className="mt-5 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
            <span>{item.productName} <span className="text-muted">({qtyLabel(item.quantity, item.unit as Unit, unitName(item.unit))})</span></span>
            <span className="shrink-0 font-medium">{money(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div className="text-muted">
          <p className="font-semibold text-ink">{t("delivering")}</p>
          <p>{order.name}, {order.phone}</p>
          <p>{order.address}, {order.city}</p>
          {order.note && <p className="mt-1 italic">"{order.note}"</p>}
        </div>
        <div className="space-y-1 sm:text-end">
          <p className="text-muted">{t("orders.subtotalLine", { amount: order.subtotal.toFixed(2), currency: t("currency") })}</p>
          <p className="text-muted">{t("orders.deliveryLine", { amount: order.deliveryFee.toFixed(2), currency: t("currency") })}</p>
          <p className="text-base font-bold">{t("orders.totalLine", { amount: order.total.toFixed(2), currency: t("currency") })}</p>
        </div>
      </div>

      {order.status === "PENDING" && (
        <button onClick={onCancel} className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-sale transition hover:bg-red-50">
          {t("cancelOrder")}
        </button>
      )}
    </article>
  );
}

export function OrdersPage() {
  const { customer, openAuth } = useCustomerAuth();
  const { t } = useLanguage();
  const { data: orders, isLoading, isError, refetch } = useMyOrders(Boolean(customer));
  const cancel = useCancelMyOrder();
  const [cancelling, setCancelling] = useState<Order | null>(null);

  if (!customer) {
    return (
      <Container className="py-16 pt-32">
        <Message title={t("orders.signInTitle")} text={t("orderHistory")} action={{ label: t("signIn"), onClick: () => openAuth() }} />
      </Container>
    );
  }

  return (
    <Container className="py-10 pt-32">
      <h1 className="mb-6 text-2xl font-extrabold text-[#073B2B]">{t("myOrdersTitle")}</h1>
      {isLoading && <TableSkeleton rows={4} />}
      {isError && <Message title={t("orders.couldNotLoad")} text={t("checkConnection")} action={{ label: t("tryAgain"), onClick: () => refetch() }} />}
      {orders && orders.length === 0 && <Message title={t("noOrders")} text={t("orders.noneYetText")} />}
      <div className="space-y-5">
        {orders?.map((order) => (
          <OrderCard key={order.id} order={order} onCancel={() => { cancel.reset(); setCancelling(order); }} />
        ))}
      </div>

      {cancelling && (
        <ConfirmDialog
          title={t("cancelThisOrder")}
          text={t("orders.cancelConfirm", { id: cancelling.id })}
          confirmLabel={t("cancelOrder")}
          busy={cancel.isPending}
          error={cancel.error?.message}
          onCancel={() => setCancelling(null)}
          onConfirm={() => cancel.mutate(cancelling.id, { onSuccess: () => setCancelling(null) })}
        />
      )}
    </Container>
  );
}
