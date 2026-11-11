import { ArrowLeft, Minus, Package, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MAX_ORDER_QUANTITY } from "../config";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";
import type { CartItem } from "../types";
import {
  formatPrice,
  grossTotal,
  lineTotal,
  qtyLabel,
  roundAmount,
  stepFor,
  trimAmount,
} from "../utils/format";
import { localizedName } from "../utils/localized";
import { CheckoutPanel } from "./CheckoutPanel";

// Plus and minus move the weight one step at a time: 0.25 kg, 0.5, 0.75, 1, 1.25 ... (pieces move by 1).
// The number in the middle can also be typed. It snaps to the nearest step and never goes under the minimum.
function QuantityControl({
  item,
  name,
  onChange,
}: {
  item: CartItem;
  name: string;
  onChange: (amount: number) => void;
}) {
  const { t, unitName } = useLanguage();
  const step = stepFor(item.unit);
  const [draft, setDraft] = useState<string | null>(null);
  const atMinimum = item.amount <= item.minQuantity + 1e-9;
  const atMaximum = item.amount >= MAX_ORDER_QUANTITY - 1e-9;

  const commit = () => {
    if (draft === null) return;
    const typed = Number(draft.replace(",", "."));
    setDraft(null);
    if (!Number.isFinite(typed) || typed <= 0) return;
    const snapped = roundAmount(Math.round(typed / step) * step);
    onChange(Math.min(MAX_ORDER_QUANTITY, Math.max(snapped, item.minQuantity)));
  };

  return (
    <div className="flex h-10 items-center rounded-xl border border-[#DCE6DF] bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(roundAmount(item.amount - step))}
        disabled={atMinimum}
        aria-label={t("cart.decrease", { name })}
        className="grid h-9 w-9 place-items-center rounded-lg text-[#078A4B] transition hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
      >
        <Minus size={15} />
      </button>

      <label className="flex min-w-[88px] items-center justify-center gap-1 px-1">
        <input
          dir="ltr"
          inputMode="decimal"
          aria-label={t("cart.quantity")}
          value={draft ?? trimAmount(item.amount)}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.target.select()}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
          className="w-12 bg-transparent text-center text-sm font-extrabold text-[#123B2A] outline-none"
        />
        <span className="text-xs font-bold text-[#718176]">{unitName(item.unit)}</span>
      </label>

      <button
        type="button"
        onClick={() => onChange(roundAmount(item.amount + step))}
        disabled={atMaximum}
        aria-label={t("cart.increase", { name })}
        className="grid h-9 w-9 place-items-center rounded-lg text-[#078A4B] transition hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

// The cart panel. It slides in from the end of the screen: the right in English, the left in Arabic.
// Colors come from the storefront: deep forest green header (like the shop hero), mint accents,
// white cards with soft green borders (like the product cards).
export function CartDrawer() {
  const { items, count, subtotal, grossSubtotal, savings, setAmount, removeItem, clearCart, isOpen, close } =
    useCart();
  const navigate = useNavigate();
  const { customer, openAuth } = useCustomerAuth();
  const { t, language, unitName, money } = useLanguage();

  // The drawer has two steps: the cart, then delivery details. Closing it always goes back to the cart.
  const [view, setView] = useState<"cart" | "checkout">("cart");
  useEffect(() => {
    if (isOpen) return;
    const timer = window.setTimeout(() => setView("cart"), 320); // after the slide-out finishes
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // An emptied cart has nothing to check out
  useEffect(() => {
    if (items.length === 0) setView("cart");
  }, [items.length]);

  const continueToCheckout = () => {
    if (!customer) return openAuth(() => setView("checkout"));
    setView("checkout");
  };

  // Escape closes the cart, and the page behind it does not scroll while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const goTo = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("cart.closeCart")}
        onClick={close}
        className={`fixed inset-0 z-40 bg-[#031D1A]/55 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart")}
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-[440px] flex-col bg-[#F5FAF7] shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
          isOpen
            ? "visible translate-x-0"
            : "invisible translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#031D1A] via-[#073B2B] to-[#0B5A2A] px-5 py-5 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-10 -top-12 h-36 w-36 rounded-full bg-[#00C98D]/15 blur-2xl"
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {view === "checkout" ? (
                <button
                  type="button"
                  onClick={() => setView("cart")}
                  aria-label={t("checkout.back")}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ArrowLeft size={19} className="rtl:rotate-180" />
                </button>
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00C98D]/15 text-[#00D6A0] ring-1 ring-[#00C98D]/30">
                  <ShoppingBasket size={20} />
                </span>
              )}
              <div>
                <h2 className="text-lg font-extrabold leading-tight">
                  {view === "checkout" ? t("deliveryDetails") : t("cart")}
                </h2>
                <p className="text-xs font-medium text-white/65">
                  {count > 0 ? t("cart.items", { count }) : t("emptyCart")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label={t("cart.closeCart")}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {view === "checkout" && items.length > 0 ? (
          <CheckoutPanel onDone={close} />
        ) : (
          <>
        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-[#078A4B] shadow-sm ring-1 ring-[#DCEAE1]">
                <ShoppingBasket size={34} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-base font-extrabold text-[#123B2A]">{t("emptyCart")}</h3>
              <p className="mt-1.5 max-w-xs text-sm leading-6 text-[#718176]">{t("cart.emptyText")}</p>
              <button
                type="button"
                onClick={() => goTo("/shop")}
                className="mt-6 rounded-xl bg-[#078A4B] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#056B3A] hover:shadow-md"
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <>
              {/* Clear cart is a destructive action, so it is red */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-[#718176]">{t("cart.items", { count })}</p>
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
                >
                  <Trash2 size={13} />
                  {t("clearCart")}
                </button>
              </div>

              <ul className="space-y-3">
                {items.map((item) => {
                  const name = localizedName(item, language);
                  const isKg = item.unit === "kg";
                  const hasDiscount = item.discount > 0;
                  const unitPrice = item.price * (1 - item.discount / 100);
                  const total = lineTotal(item.price, item.amount, item.unit, item.discount);
                  const gross = grossTotal(item.price, item.amount, item.unit);

                  return (
                    <li
                      key={item.productId}
                      className="rounded-2xl border border-[#E1ECE4] bg-white p-3 shadow-sm"
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F0F7F1]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Package size={26} strokeWidth={1.5} className="text-[#078A4B]" />
                          )}
                          {hasDiscount && (
                            <span className="absolute start-1 top-1 rounded-full bg-[#078A4B] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                              {t("cart.discountOff", { percent: item.discount })}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#123B2A]">
                              {name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              aria-label={t("cart.removeItem", { name })}
                              className="-me-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <p className="mt-0.5 text-[11px] text-[#718176]">
                            {isKg
                              ? t("cart.perQuarter", { price: formatPrice(unitPrice), currency: t("currency") })
                              : t("cart.perUnit", {
                                  price: formatPrice(unitPrice),
                                  currency: t("currency"),
                                  unit: unitName(item.unit),
                                })}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-[#45675A]">
                            {qtyLabel(item.amount, item.unit, unitName(item.unit))}
                          </p>
                        </div>
                      </div>

                      {/* Quantity and line total */}
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EDF3EE] pt-3">
                        <QuantityControl
                          item={item}
                          name={name}
                          onChange={(amount) => setAmount(item.productId, amount)}
                        />

                        <p className="text-end">
                          <span className="block text-base font-extrabold leading-tight text-[#123B2A]">
                            {money(total)}
                          </span>
                          {hasDiscount && (
                            <s className="block text-[11px] font-semibold text-[#87958D]">
                              {formatPrice(gross)}
                            </s>
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <footer className="border-t border-[#DCEAE1] bg-white px-5 pb-5 pt-4 shadow-[0_-8px_24px_rgba(7,59,43,0.06)]">
            <dl className="space-y-2 text-sm">
              {savings > 0 && (
                <>
                  <div className="flex justify-between text-[#718176]">
                    <dt>{t("cart.originalPrice")}</dt>
                    <dd>
                      <s>{money(grossSubtotal)}</s>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#EAF6EE] px-3 py-2 font-bold text-[#078A4B]">
                    <dt>{t("checkout.discount")}</dt>
                    <dd>− {money(savings)}</dd>
                  </div>
                </>
              )}

              <div className="flex justify-between text-[#718176]">
                <dt>{t("delivery")}</dt>
                <dd>{t("calculatedAtCheckout")}</dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#E8EEE9] pt-3 text-[#123B2A]">
                <dt className="text-base font-extrabold">{t("subtotal")}</dt>
                <dd className="text-xl font-extrabold">{money(subtotal)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={continueToCheckout}
              className="mt-4 h-12 w-full rounded-xl bg-[#078A4B] text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#056B3A] hover:shadow-md"
            >
              {t("continueOrder")}
            </button>
            <button
              type="button"
              onClick={() => goTo("/shop")}
              className="mt-1 h-10 w-full rounded-xl text-sm font-bold text-[#078A4B] transition hover:bg-[#EAF6EE]"
            >
              {t("continueShopping")}
            </button>
          </footer>
        )}
          </>
        )}
      </aside>
    </>
  );
}
