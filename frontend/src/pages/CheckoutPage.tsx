import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FormField, inputClass } from "../components/admin/FormField";
import { Container } from "../components/Container";
import { Message } from "../components/Message";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePlaceOrder } from "../hooks/useOrders";
import { useCities } from "../hooks/useShopData";
import type { Customer } from "../types/customer";
import { qtyLabel, formatPrice, lineTotal } from "../utils/format";
import { localizedName } from "../utils/localized";

// Checkout: delivery details, delivery city and fee, order summary.
// The prices shown here are a preview. The server works out the real total when the order is placed.
export function CheckoutPage() {
  const { customer, openAuth } = useCustomerAuth();
  const { items } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!customer) {
    return (
      <Container className="py-16 pt-32">
        <Message
          title={t("checkout.signInTitle")}
          text={t("cartSaved")}
          action={{ label: t("checkout.signInLabel"), onClick: () => openAuth() }}
        />
      </Container>
    );
  }
  if (items.length === 0) {
    return (
      <Container className="py-16 pt-32">
        <Message
          title={t("emptyCart")}
          text={t("addFresh")}
          action={{ label: t("goToShop"), onClick: () => navigate("/shop") }}
        />
      </Container>
    );
  }
  return <CheckoutForm customer={customer} />;
}

function CheckoutForm({ customer }: { customer: Customer }) {
  const { items, subtotal, grossSubtotal, savings, emptyCart } = useCart();
  const { t, language, unitName, money } = useLanguage();
  const { data: cities = [], isLoading } = useCities();
  const place = usePlaceOrder();
  const navigate = useNavigate();

  // The delivery details start from the account, and can be changed for this order.
  const [f, setF] = useState({ name: customer.name, phone: customer.phone ?? "", address: customer.address, note: "" });
  const [cityId, setCityId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof f) => (value: string) => setF((current) => ({ ...current, [key]: value }));

  const city = cities.find((c) => c.id === Number(cityId));
  const fee = city?.fee ?? 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
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
          navigate("/orders");
        },
      },
    );
  };

  return (
    <Container className="py-10 pt-32">
      <h1 className="mb-6 text-2xl font-extrabold text-[#073B2B]">{t("deliveryDetails")}</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#DCEAE1] bg-white p-6 shadow-sm">
          {place.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{place.error.message}</p>}

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

          <button type="submit" disabled={place.isPending} className="h-12 w-full rounded-xl bg-[#078A4B] font-extrabold text-white transition hover:bg-[#056B3A] disabled:opacity-50">
            {place.isPending ? t("placingOrder") : t("checkout.placeOrderTotal", { total: formatPrice(subtotal + fee), currency: t("currency") })}
          </button>
          <p className="text-center text-xs text-muted">{t("cashOrCard")}</p>
        </form>

        <aside className="h-fit rounded-2xl border border-[#DCEAE1] bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="mb-4 font-extrabold text-[#123B2A]">{t("orderSummary")}</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">{localizedName(item, language)}</p>
                  <p className="text-xs text-muted">
                    {qtyLabel(item.amount, item.unit, unitName(item.unit))}
                    {item.discount > 0 && <span className="ms-2 font-bold text-[#078A4B]">-{item.discount}%</span>}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">{money(lineTotal(item.price, item.amount, item.unit, item.discount))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            {savings > 0 && (
              <>
                <div className="flex justify-between text-muted"><span>{t("cart.originalPrice")}</span><s>{money(grossSubtotal)}</s></div>
                <div className="flex justify-between font-semibold text-[#078A4B]"><span>{t("checkout.discount")}</span><span>− {money(savings)}</span></div>
              </>
            )}
            <div className="flex justify-between text-muted"><span>{t("subtotal")}</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-muted">
              <span>{city ? t("checkout.deliveryTo", { city: city.name }) : t("delivery")}</span>
              <span>{city ? money(fee) : t("checkout.chooseACity")}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-extrabold">
              <span>{t("total")}</span><span>{money(subtotal + fee)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">{t("checkout.finalNote")}</p>
          <Link to="/shop" className="mt-4 block text-center text-sm font-bold text-[#078A4B] hover:underline">{t("keepShopping")}</Link>
        </aside>
      </div>
    </Container>
  );
}
