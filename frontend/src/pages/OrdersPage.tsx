import { useState } from "react";
import { TableSkeleton } from "../components/Skeleton";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { Container } from "../components/Container";
import { Message } from "../components/Message";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useCancelMyOrder, useMyOrders } from "../hooks/useOrders";
import type { Unit } from "../types";
import type { Order, OrderStatus } from "../types/order";
import { amountLabel, formatDate, formatPrice } from "../utils/format";
import { STATUS_LABEL, STATUS_STYLE, TRACKER_STEPS } from "../utils/orderStatus";

function Tracker({ status }: { status: OrderStatus }) {
  const current = TRACKER_STEPS.indexOf(status);
  return (
    <ol className="mt-5 grid grid-cols-5 gap-1.5 text-center text-[11px]">
      {TRACKER_STEPS.map((step, index) => (
        <li key={step}>
          <div className={`h-1.5 rounded-full ${index <= current ? "bg-brand" : "bg-line"}`} />
          <span className={`mt-1.5 block ${index <= current ? "font-semibold text-brand" : "text-muted"}`}>{STATUS_LABEL[step]}</span>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Order #{order.id}</h2>
          <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
      </div>

      {order.status !== "CANCELLED" && <Tracker status={order.status} />}

      <ul className="mt-5 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
            <span>{item.productName} <span className="text-muted">({amountLabel(item.quantity, item.unit as Unit)})</span></span>
            <span className="shrink-0 font-medium">{formatPrice(item.lineTotal)} JOD</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div className="text-muted">
          <p className="font-semibold text-ink">Delivering to</p>
          <p>{order.name}, {order.phone}</p>
          <p>{order.address}, {order.city}</p>
          {order.note && <p className="mt-1 italic">"{order.note}"</p>}
        </div>
        <div className="space-y-1 sm:text-right">
          <p className="text-muted">Subtotal {formatPrice(order.subtotal)} JOD</p>
          <p className="text-muted">Delivery {formatPrice(order.deliveryFee)} JOD</p>
          <p className="text-base font-bold">Total {formatPrice(order.total)} JOD</p>
        </div>
      </div>

      {order.status === "PENDING" && (
        <button onClick={onCancel} className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-sale transition hover:bg-red-50">
          Cancel order
        </button>
      )}
    </article>
  );
}

export function OrdersPage() {
  const { customer, openAuth } = useCustomerAuth();
  const { data: orders, isLoading, isError, refetch } = useMyOrders(Boolean(customer));
  const cancel = useCancelMyOrder();
  const [cancelling, setCancelling] = useState<Order | null>(null);

  if (!customer) {
    return (
      <Container className="py-16">
        <Message title="Sign in to see your orders" text="Your order history and delivery status will show here." action={{ label: "Sign in", onClick: () => openAuth() }} />
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand">My orders</h1>
      {isLoading && <TableSkeleton rows={4} />}
      {isError && <Message title="Could not load your orders" text="Check your connection and try again." action={{ label: "Try again", onClick: () => refetch() }} />}
      {orders && orders.length === 0 && <Message title="No orders yet" text="When you place an order you can follow it here." />}
      <div className="space-y-5">
        {orders?.map((order) => (
          <OrderCard key={order.id} order={order} onCancel={() => { cancel.reset(); setCancelling(order); }} />
        ))}
      </div>

      {cancelling && (
        <ConfirmDialog
          title="Cancel this order"
          text={`Cancel order #${cancelling.id}? You can only cancel before we confirm it.`}
          confirmLabel="Cancel order"
          busy={cancel.isPending}
          error={cancel.error?.message}
          onCancel={() => setCancelling(null)}
          onConfirm={() => cancel.mutate(cancelling.id, { onSuccess: () => setCancelling(null) })}
        />
      )}
    </Container>
  );
}
