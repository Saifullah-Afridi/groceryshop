import { Check, ChevronDown, Package, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { Container } from "../components/Container";
import { Message } from "../components/Message";
import { OrdersHero } from "../components/OrdersHero";
import { Skeleton } from "../components/Skeleton";
import { MAX_ORDER_QUANTITY } from "../config";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage, type TranslationKey } from "../context/LanguageContext";
import { useCancelMyOrder, useMyOrders } from "../hooks/useOrders";
import { getProducts } from "../services/productService";
import type { Unit } from "../types";
import type { Order, OrderStatus } from "../types/order";
import { qtyLabel } from "../utils/format";
import { TRACKER_STEPS, statusKey } from "../utils/orderStatus";

type Tab = "active" | "history";
type HistoryFilter = "ALL" | "DELIVERED" | "CANCELLED";

const PAGE_SIZE = 8;

// Active = not delivered and not cancelled yet
const isActive = (order: Order) => order.status === "PENDING" || order.status === "ON_THE_WAY";

// The small coloured label with a dot: Pending, On the way, Delivered, Cancelled
const CHIP: Record<OrderStatus, { box: string; dot: string }> = {
  PENDING: { box: "bg-[#FFF1CC] text-[#8A5A00]", dot: "bg-[#E8A100]" },
  ON_THE_WAY: { box: "bg-[#D8F5FA] text-[#0A6C7A]", dot: "bg-[#12A4B8]" },
  DELIVERED: { box: "bg-[#DDF3E6] text-[#0B6B3A]", dot: "bg-[#078A4B]" },
  CANCELLED: { box: "bg-[#FDE2E2] text-[#B42318]", dot: "bg-[#E03131]" },
};

function StatusChip({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${CHIP[status].box}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${CHIP[status].dot}`} />
      {t(statusKey(status))}
    </span>
  );
}

// ---------- the "Order again" button ----------
// Puts the same products and amounts back in the cart, at today's price. Products that no longer exist or are out of stock are skipped.
function useOrderAgain() {
  const { addItem, open } = useCart();
  const { t } = useLanguage();
  const [busyId, setBusyId] = useState<number | null>(null);

  const orderAgain = async (order: Order) => {
    setBusyId(order.id);
    try {
      const products = await getProducts();
      let added = 0;
      for (const item of order.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || product.stockQuantity <= 0) continue;
        addItem(product, Math.min(item.quantity, MAX_ORDER_QUANTITY));
        added += 1;
      }
      if (added < order.items.length) toast.warning(t("orders.reorderMissing"));
      if (added > 0) open();
    } catch {
      toast.error(t("orders.reorderFailed"));
    } finally {
      setBusyId(null);
    }
  };

  return { orderAgain, busyId };
}

// ---------- tracker: Placed -> On the way -> Delivered ----------
function Tracker({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  const current = TRACKER_STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-3 px-2 sm:px-8">
      {TRACKER_STEPS.map((step, index) => {
        const done = index < current || status === "DELIVERED";
        const isCurrent = index === current && status !== "DELIVERED";
        const label = step === "PENDING" ? t("orders.stepLabel.PENDING") : t(statusKey(step));

        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute start-[-50%] top-[14px] h-0.5 w-full -translate-y-1/2 ${index <= current ? "bg-[#078A4B]" : "bg-[#DCE6DF]"}`}
              />
            )}
            <span
              className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${
                done
                  ? "border-[#078A4B] bg-[#078A4B] text-white"
                  : isCurrent
                    ? "border-[#078A4B] bg-white text-[#078A4B] ring-4 ring-[#078A4B]/15"
                    : "border-[#DCE6DF] bg-white text-[#9AA8A0]"
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className={`mt-2 text-xs ${isCurrent ? "font-extrabold text-[#078A4B]" : done ? "font-semibold text-[#45675A]" : "text-[#9AA8A0]"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- shared pieces ----------
function ItemsList({ order }: { order: Order }) {
  const { money, unitName } = useLanguage();
  return (
    <ul className="divide-y divide-[#EDF3EE]">
      {order.items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#123B2A]">{item.productName}</p>
            <p className="text-xs text-[#87958D]">{qtyLabel(item.quantity, item.unit as Unit, unitName(item.unit))}</p>
          </div>
          <span className="shrink-0 text-sm font-extrabold text-[#123B2A]">{money(item.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

function Totals({ order }: { order: Order }) {
  const { t, money } = useLanguage();
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between text-[#718176]"><dt>{t("subtotal")}</dt><dd>{money(order.subtotal)}</dd></div>
      <div className="flex justify-between border-t border-[#EDF3EE] pt-2.5 text-[#718176]"><dt>{t("delivery")}</dt><dd>{money(order.deliveryFee)}</dd></div>
      <div className="flex justify-between border-t border-[#EDF3EE] pt-2.5 font-extrabold text-[#123B2A]"><dt>{t("total")}</dt><dd>{money(order.total)}</dd></div>
    </dl>
  );
}

// ---------- ACTIVE orders ----------
function ActiveOrderCard({ order, defaultOpen, onCancel }: { order: Order; defaultOpen: boolean; onCancel: () => void }) {
  const { t, money, date } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const pending = order.status === "PENDING";

  return (
    <article className="overflow-hidden rounded-2xl border border-[#DCEAE1] bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#CDEBDD] bg-[#EAF6EE] text-[#078A4B]">
            <Package size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-[#123B2A]">{t("orders.orderNumber", { id: order.id })}</h3>
            <p className="truncate text-xs text-[#718176]">
              {t("orders.placedOn", { date: date(order.createdAt) })}
              {!open && ` · ${t("cart.items", { count: order.items.length })} · ${money(order.total)}`}
            </p>
          </div>
        </div>
        <StatusChip status={order.status} />
      </header>

      <div className="border-t border-[#EDF3EE] px-5 py-5 sm:px-6">
        {open && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#EAF6EE] px-5 py-4">
            <div>
              <p className="text-lg font-extrabold text-[#073B2B]">{t(`orders.banner.${order.status}.title` as TranslationKey)}</p>
              <p className="text-sm text-[#45675A]">{t(`orders.banner.${order.status}.text` as TranslationKey, { city: order.city })}</p>
            </div>
            <div className="text-end">
              <p className="text-2xl font-extrabold text-[#073B2B]">{money(order.total)}</p>
              <p className="text-xs text-[#45675A]">{t("cart.items", { count: order.items.length })}</p>
            </div>
          </div>
        )}

        <Tracker status={order.status} />

        {open && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-[#DCEAE1] p-5">
              <h4 className="mb-4 text-sm font-extrabold text-[#123B2A]">{t("orders.items")}</h4>
              <ItemsList order={order} />
            </section>

            <div className="space-y-4">
              <section className="rounded-xl border border-[#DCEAE1] p-5">
                <h4 className="mb-2 text-sm font-extrabold text-[#123B2A]">{t("delivering")}</h4>
                <p className="text-sm text-[#45675A]">
                  {order.name} · <span dir="ltr">{order.phone}</span>
                </p>
                <p className="text-sm text-[#45675A]">{order.address}, {order.city}</p>
                {order.note && <p className="mt-2 text-xs italic text-[#87958D]">“{order.note}”</p>}
              </section>
              <section className="rounded-xl border border-[#DCEAE1] p-5">
                <Totals order={order} />
              </section>
            </div>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF3EE] bg-[#FAFCFA] px-5 py-3 sm:px-6">
        <p className="text-xs text-[#718176]">
          {pending ? t("orders.cancelHintPending") : t("orders.cancelHintLocked")}{" "}
          <Link to="/contact" className="font-bold text-[#078A4B] hover:underline">{t("orders.helpLink")}</Link>
        </p>

        <div className="flex items-center gap-2">
          {pending && (
            <button onClick={onCancel} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50">
              {t("cancelOrder")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="rounded-lg border border-[#DCEAE1] bg-white px-4 py-2 text-sm font-bold text-[#123B2A] transition hover:border-[#078A4B]"
          >
            {open ? t("orders.hideDetails") : t("orders.showDetails")}
          </button>
        </div>
      </footer>
    </article>
  );
}

// ---------- HISTORY: one row per order ----------
function HistoryRow({ order, open, onToggle, onOrderAgain, busy }: { order: Order; open: boolean; onToggle: () => void; onOrderAgain: () => void; busy: boolean }) {
  const { t, money, language } = useLanguage();
  const delivered = order.status === "DELIVERED";
  const names = order.items.slice(0, 3).map((item) => item.productName).join(", ");
  const more = order.items.length - 3;
  const shortDate = new Date(order.createdAt).toLocaleDateString(language === "ar" ? "ar-u-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className={open ? "bg-[#FAFCFA]" : ""}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-start sm:gap-4"
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${delivered ? "border-[#CDEBDD] bg-[#EAF6EE] text-[#078A4B]" : "border-red-200 bg-red-50 text-red-600"}`}>
            {delivered ? <Check size={18} /> : <X size={18} />}
          </span>
          <span className="shrink-0">
            <span className="block font-extrabold text-[#123B2A]">{t("orders.orderNumber", { id: order.id })}</span>
            <span className="block text-xs text-[#718176]">{shortDate}</span>
          </span>
          <span className="hidden min-w-0 flex-1 truncate ps-2 text-sm text-[#718176] lg:block">
            {names}
            {more > 0 && ` ${t("admin.ud.moreItems", { count: more })}`}
          </span>
          <ChevronDown size={16} className={`ms-auto shrink-0 text-[#9AA8A0] transition lg:hidden ${open ? "rotate-180" : ""}`} />
        </button>

        <span className="font-extrabold text-[#123B2A]">{money(order.total)}</span>
        <StatusChip status={order.status} />
        <button
          type="button"
          onClick={onOrderAgain}
          disabled={busy}
          className={`rounded-lg border px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
            open ? "border-[#078A4B] bg-[#078A4B] text-white hover:bg-[#056B3A]" : "border-[#078A4B] bg-white text-[#078A4B] hover:bg-[#EAF6EE]"
          }`}
        >
          {t("orders.orderAgain")}
        </button>
      </div>

      {open && (
        <div className="grid gap-6 border-t border-[#EDF3EE] px-4 py-5 sm:px-5 md:grid-cols-2 md:gap-10 md:ps-[4.75rem]">
          <ItemsList order={order} />
          <div>
            <Totals order={order} />
            <p className="mt-3 text-xs text-[#87958D]">
              {delivered ? t("orders.deliveredTo", { place: `${order.address}, ${order.city}` }) : t("orders.cancelledNote")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const { customer, openAuth } = useCustomerAuth();
  const { t, language } = useLanguage();
  const { data: orders, isLoading, isError, refetch } = useMyOrders(Boolean(customer));
  const cancel = useCancelMyOrder();
  const navigate = useNavigate();
  const { orderAgain, busyId } = useOrderAgain();

  const [tab, setTab] = useState<Tab | null>(null);
  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("ALL");
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [cancelling, setCancelling] = useState<Order | null>(null);

  const all = orders ?? [];
  const activeAll = all.filter(isActive);
  const historyAll = all.filter((order) => !isActive(order));

  // Open on "Active orders" when there is one, otherwise on "Order history"
  const currentTab: Tab = tab ?? (activeAll.length > 0 || historyAll.length === 0 ? "active" : "history");

  const matches = (order: Order) => {
    const text = search.trim().toLowerCase().replace("#", "");
    return !text || String(order.id).includes(text) || order.items.some((item) => item.productName.toLowerCase().includes(text));
  };

  const active = activeAll.filter(matches);
  const history = historyAll.filter((order) => matches(order) && (historyFilter === "ALL" || order.status === historyFilter));

  // History grouped by month, newest first (the API already sends newest first)
  const groups = useMemo(() => {
    const locale = language === "ar" ? "ar-u-nu-latn" : "en-GB";
    const map = new Map<string, Order[]>();
    for (const order of history.slice(0, visible)) {
      const label = new Date(order.createdAt).toLocaleDateString(locale, { month: "long", year: "numeric" });
      map.set(label, [...(map.get(label) ?? []), order]);
    }
    return [...map.entries()];
  }, [history, visible, language]);

  const historyCount = (status: HistoryFilter) => (status === "ALL" ? historyAll.length : historyAll.filter((order) => order.status === status).length);

  if (!customer) {
    return (
      <>
        <OrdersHero />
        <div className="bg-[#F5FAF7]">
          <Container className="py-16">
            <Message title={t("orders.signInTitle")} text={t("orderHistory")} action={{ label: t("signIn"), onClick: () => openAuth() }} />
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <OrdersHero />

      <div className="bg-[#F5FAF7] pb-20 pt-8">
        <Container>
          <div className="mx-auto max-w-6xl">
            {isLoading && (
              <div className="space-y-4" role="status" aria-busy="true">
                {[0, 1].map((key) => <Skeleton key={key} className="h-56 w-full rounded-2xl bg-[#E8F1E9]" />)}
              </div>
            )}

            {isError && <Message title={t("orders.couldNotLoad")} text={t("checkConnection")} action={{ label: t("tryAgain"), onClick: () => refetch() }} />}

            {orders && orders.length === 0 && (
              <Message title={t("noOrders")} text={t("orders.noneYetText")} action={{ label: t("goToShop"), onClick: () => navigate("/shop") }} />
            )}

            {orders && orders.length > 0 && (
              <>
                {/* Tabs and search */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div role="tablist" className="inline-flex rounded-full border border-[#DCEAE1] bg-white p-1 shadow-sm">
                    {([["active", t("orders.tab.active"), activeAll.length], ["history", t("orders.tab.history"), historyAll.length]] as const).map(([key, label, count]) => (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={currentTab === key}
                        type="button"
                        onClick={() => { setTab(key); setVisible(PAGE_SIZE); }}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition sm:px-5 ${
                          currentTab === key ? "bg-[#078A4B] text-white shadow-sm" : "text-[#45675A] hover:text-[#078A4B]"
                        }`}
                      >
                        {label}
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${currentTab === key ? "bg-white/25 text-white" : "bg-[#EAF6EE] text-[#078A4B]"}`}>{count}</span>
                      </button>
                    ))}
                  </div>

                  <label className="relative w-full sm:w-80">
                    <Search size={16} className="pointer-events-none absolute start-3.5 top-3 text-[#87958D]" />
                    <input
                      value={search}
                      onChange={(event) => { setSearch(event.target.value); setVisible(PAGE_SIZE); }}
                      placeholder={t("orders.search")}
                      className="h-10 w-full rounded-xl border border-[#DCEAE1] bg-white ps-10 pe-4 text-sm shadow-sm outline-none transition focus:border-[#078A4B] focus:ring-2 focus:ring-[#078A4B]/10"
                    />
                  </label>
                </div>

                {/* ACTIVE ORDERS */}
                {currentTab === "active" &&
                  (active.length === 0 ? (
                    <Message
                      title={search ? t("orders.noMatch") : t("orders.noActive")}
                      text={search ? t("orders.noMatchText") : t("orders.noActiveText")}
                      action={search ? undefined : { label: t("goToShop"), onClick: () => navigate("/shop") }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {active.map((order) => (
                        <ActiveOrderCard
                          key={order.id}
                          order={order}
                          defaultOpen={order.status === "ON_THE_WAY"}
                          onCancel={() => { cancel.reset(); setCancelling(order); }}
                        />
                      ))}
                    </div>
                  ))}

                {/* ORDER HISTORY */}
                {currentTab === "history" && (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {(["ALL", "DELIVERED", "CANCELLED"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => { setHistoryFilter(status); setVisible(PAGE_SIZE); }}
                            className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                              historyFilter === status ? "border-[#073B2B] bg-[#073B2B] text-white" : "border-[#DCEAE1] bg-white text-[#45675A] hover:border-[#078A4B]"
                            }`}
                          >
                            {status === "ALL" ? t("all") : t(statusKey(status))} · {historyCount(status)}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-[#87958D]">{t("orders.newestFirst")}</span>
                    </div>

                    {history.length === 0 ? (
                      <Message title={t("orders.noMatch")} text={t("orders.noMatchText")} />
                    ) : (
                      <>
                        {groups.map(([month, list]) => (
                          <section key={month} className="mb-5">
                            <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#718176]">{month}</h2>
                            <div className="divide-y divide-[#EDF3EE] overflow-hidden rounded-2xl border border-[#DCEAE1] bg-white shadow-sm">
                              {list.map((order) => (
                                <HistoryRow
                                  key={order.id}
                                  order={order}
                                  open={openRow === order.id}
                                  onToggle={() => setOpenRow((current) => (current === order.id ? null : order.id))}
                                  onOrderAgain={() => orderAgain(order)}
                                  busy={busyId === order.id}
                                />
                              ))}
                            </div>
                          </section>
                        ))}

                        {history.length > visible && (
                          <button
                            type="button"
                            onClick={() => setVisible((value) => value + PAGE_SIZE)}
                            className="mx-auto block rounded-xl border border-[#DCEAE1] bg-white px-6 py-3 text-sm font-bold text-[#078A4B] transition hover:border-[#078A4B] hover:bg-[#F0F8F2]"
                          >
                            {t("orders.loadMore")}
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Container>
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
    </>
  );
}
