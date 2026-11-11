import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePlaceOrder } from "../hooks/useOrders";
import { useCities } from "../hooks/useShopData";
import { formatPrice, lineTotal, qtyLabel } from "../utils/format";
import { localizedName } from "../utils/localized";
import { FormField, inputClass } from "./admin/FormField";

// The second step of the cart drawer: delivery details and the order total.
// It renders the scrolling body and the sticky footer, so it sits directly inside the drawer.
// The prices shown here are a preview. The server works out the real total when the order is placed.
export function CheckoutPanel({ onDone }: { onDone: () => void }) {
  const { customer } = useCustomerAuth();
  const { items, subtotal, grossSubtotal, savings, emptyCart } = useCart();
  const { t, language, unitName, money } = useLanguage();
  const { data: cities = [], isLoading } = useCities();
  const place = usePlaceOrder();
  const navigate = useNavigate();

  // The delivery details start from the account, and can be changed for this order.
  const [f, setF] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    note: "",
  });
  const [cityId, setCityId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof f) => (value: string) => setF((current) => ({ ...current, [key]: value }));

  const city = cities.find((c) => c.id === Number(cityId));
  const fee = city?.fee ?? 0;
  const cartIsEmpty = items.length === 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (cartIsEmpty) return;
    const digits = f.phone.replace(/\D/g, "").length;
    const found: Record<string, string> = {};
    if (f.name.trim().length < 2) found.name = t("checkout.errName");
    if (!/^\+?[\d\s-]+$/.test(f.phone.trim()) || digits < 8 || digits > 15) found.phone = t("checkout.errPhone");
    if (f.address.trim().length < 5) found.address = t("checkout.errAddress");
    if (!city) found.city = t("checkout.errCity");
    setErrors(found);
    if (Object.keys(found).length > 0 || !city) return;

    place.mutate(
      {
        items: items.map((item) => ({ productId: item.productId, quantity: item.amount })), // no prices are sent
        cityId: city.id,
        name: f.name.trim(),
        phone: f.phone.trim(),
        address: f.address.trim(),
        note: f.note.trim(),
      },
      {
        onSuccess: (order) => {
          emptyCart();
          toast.success(t("checkout.placed", { id: order.id }), { autoClose: 5000 });
          onDone();
          navigate("/orders");
        },
        // Normal orders cannot hit a server rule (the cart already keeps to the limits), so this is a plain notice.
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (!customer) return null;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <form id="checkout-form" onSubmit={submit} className="space-y-4">
          {/* Short order summary */}
          <ul className="divide-y divide-[#EDF3EE] rounded-2xl border border-[#E1ECE4] bg-white px-3 shadow-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#123B2A]">{localizedName(item, language)}</p>
                  <p className="text-xs text-[#718176]">
                    {qtyLabel(item.amount, item.unit, unitName(item.unit))}
                    {item.discount > 0 && (
                      <span className="ms-2 font-bold text-[#078A4B]">{t("cart.discountOff", { percent: item.discount })}</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 font-bold text-[#123B2A]">
                  {money(lineTotal(item.price, item.amount, item.unit, item.discount))}
                </span>
              </li>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("fullName")} error={errors.name}>
              <input value={f.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" className={inputClass} />
            </FormField>
            <FormField label={t("phone")} error={errors.phone}>
              <input type="tel" value={f.phone} onChange={(e) => set("phone")(e.target.value)} autoComplete="tel" className={inputClass} placeholder={t("checkout.phonePlaceholder")} />
            </FormField>
          </div>

          <FormField label={t("city")} error={errors.city}>
            <select value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={isLoading} className={inputClass}>
              <option value="">{isLoading ? t("checkout.loadingCities") : t("chooseCity")}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {t("checkout.cityOption", { name: c.name, fee: formatPrice(c.fee), currency: t("currency") })}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t("address")} error={errors.address}>
            <textarea rows={3} value={f.address} onChange={(e) => set("address")(e.target.value)} autoComplete="street-address" className={`${inputClass} h-auto py-2`} />
          </FormField>

          <FormField label={t("driverNote")}>
            <textarea rows={2} value={f.note} onChange={(e) => set("note")(e.target.value)} className={`${inputClass} h-auto py-2`} placeholder={t("checkout.driverPlaceholder")} />
          </FormField>
        </form>
      </div>

      <footer className="border-t border-[#DCEAE1] bg-white px-5 pb-5 pt-4 shadow-[0_-8px_24px_rgba(7,59,43,0.06)]">
        <dl className="space-y-2 text-sm">
          {savings > 0 && (
            <>
              <div className="flex justify-between text-[#718176]">
                <dt>{t("cart.originalPrice")}</dt>
                <dd><s>{money(grossSubtotal)}</s></dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#EAF6EE] px-3 py-2 font-bold text-[#078A4B]">
                <dt>{t("checkout.discount")}</dt>
                <dd>− {money(savings)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between text-[#718176]">
            <dt>{t("subtotal")}</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-[#718176]">
            <dt>{city ? t("checkout.deliveryTo", { city: city.name }) : t("delivery")}</dt>
            <dd>{city ? money(fee) : t("checkout.chooseACity")}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-[#E8EEE9] pt-3 text-[#123B2A]">
            <dt className="text-base font-extrabold">{t("total")}</dt>
            <dd className="text-xl font-extrabold">{money(subtotal + fee)}</dd>
          </div>
        </dl>

        {/* Disabled when the cart is empty or the order is already being sent */}
        <button
          type="submit"
          form="checkout-form"
          disabled={cartIsEmpty || place.isPending}
          className="mt-4 h-12 w-full rounded-xl bg-[#078A4B] text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#056B3A] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#C8CBC9] disabled:shadow-none disabled:hover:translate-y-0"
        >
          {place.isPending
            ? t("placingOrder")
            : t("checkout.placeOrderTotal", { total: formatPrice(subtotal + fee), currency: t("currency") })}
        </button>
      </footer>
    </>
  );
}
