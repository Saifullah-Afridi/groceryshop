import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FormField, inputClass } from "../components/admin/FormField";
import { Container } from "../components/Container";
import { Message } from "../components/Message";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { usePlaceOrder } from "../hooks/useOrders";
import { useCities } from "../hooks/useShopData";
import type { Customer } from "../types/customer";
import { amountLabel, formatPrice, lineTotal } from "../utils/format";

// Checkout: delivery details, delivery city and fee, order summary.
// The prices shown here are a preview. The server works out the real total when the order is placed.
export function CheckoutPage() {
  const { customer, openAuth } = useCustomerAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  if (!customer) {
    return (
      <Container className="py-16">
        <Message title="Sign in to check out" text="Your cart is saved. Sign in to enter your delivery details." action={{ label: "Sign in", onClick: () => openAuth() }} />
      </Container>
    );
  }
  if (items.length === 0) {
    return (
      <Container className="py-16">
        <Message title="Your cart is empty" text="Add some fresh products first." action={{ label: "Go to the shop", onClick: () => navigate("/shop") }} />
      </Container>
    );
  }
  return <CheckoutForm customer={customer} />;
}

function CheckoutForm({ customer }: { customer: Customer }) {
  const { items, subtotal, emptyCart } = useCart();
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
    if (f.name.trim().length < 2) found.name = "Enter your name";
    if (!/^\+?[\d\s-]+$/.test(f.phone.trim()) || digits < 8 || digits > 15) found.phone = "Enter a valid phone number";
    if (f.address.trim().length < 5) found.address = "Enter your delivery address";
    if (!city) found.city = "Choose your city";
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
          toast.success(`Order #${order.id} placed! We will start preparing it now.`, { autoClose: 5000 });
          navigate("/orders");
        },
      },
    );
  };

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand">Delivery details</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
          {place.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{place.error.message}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" error={errors.name}>
              <input value={f.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" className={inputClass} />
            </FormField>
            <FormField label="Phone number" error={errors.phone}>
              <input type="tel" value={f.phone} onChange={(e) => set("phone")(e.target.value)} autoComplete="tel" className={inputClass} placeholder="07X XXX XXXX" />
            </FormField>
          </div>
          <FormField label="City" error={errors.city}>
            <select value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={isLoading} className={inputClass}>
              <option value="">{isLoading ? "Loading cities..." : "Choose your city"}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (delivery {formatPrice(c.fee)} JOD)</option>
              ))}
            </select>
          </FormField>
          <FormField label="Address" error={errors.address}>
            <textarea rows={3} value={f.address} onChange={(e) => set("address")(e.target.value)} autoComplete="street-address" className={`${inputClass} h-auto py-2`} />
          </FormField>
          <FormField label="Note for the driver (optional)">
            <textarea rows={2} value={f.note} onChange={(e) => set("note")(e.target.value)} className={`${inputClass} h-auto py-2`} placeholder="Floor, landmark, best time to call" />
          </FormField>

          <button type="submit" disabled={place.isPending} className="h-12 w-full rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50">
            {place.isPending ? "Placing your order..." : `Place order, ${formatPrice(subtotal + fee)} JOD`}
          </button>
          <p className="text-center text-xs text-muted">Pay with cash or card when your order arrives.</p>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-bold">Order summary</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{amountLabel(item.amount, item.unit)}</p>
                </div>
                <span className="shrink-0 font-semibold">{formatPrice(lineTotal(item.price, item.amount, item.unit))} JOD</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)} JOD</span></div>
            <div className="flex justify-between text-muted">
              <span>Delivery{city ? ` to ${city.name}` : ""}</span>
              <span>{city ? `${formatPrice(fee)} JOD` : "Choose a city"}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <span>Total</span><span>{formatPrice(subtotal + fee)} JOD</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">The final total is confirmed by our server when you place the order.</p>
          <Link to="/shop" className="mt-4 block text-center text-sm font-semibold text-brand hover:underline">Keep shopping</Link>
        </aside>
      </div>
    </Container>
  );
}
