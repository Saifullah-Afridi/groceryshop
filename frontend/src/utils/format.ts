import { MAX_ORDER_QUANTITY } from "../config";
import type { Unit } from "../types";

export const formatPrice = (n: number) => n.toFixed(2);

// kg items change in quarter-kilo steps, everything else by one
export const QUARTER = 0.25;
export const stepFor = (unit: Unit) => (unit === "kg" ? QUARTER : 1);

// Floating point safe: 0.25 * 3 is exactly 0.75 here.
export const roundAmount = (n: number) => Math.round(n * 100) / 100;

// Minimum selectable amount is always one step. Admin stock alerts do not restrict orders.
export const minAmountFor = (product: { unit: Unit; minQuantity?: number }) => stepFor(product.unit);

export const amountLabel = (amount: number, unit: Unit, unitLabel?: string) =>
  unit === "kg"
    ? `${amount.toFixed(2)} ${unitLabel ?? "kg"}`
    : `${amount} ${unitLabel ?? unit}`;

// 1.00 -> "1", 0.50 -> "0.5", 0.25 -> "0.25". Used in the cart, where short numbers read better.
export const trimAmount = (amount: number) => String(Number(amount.toFixed(2)));
export const qtyLabel = (amount: number, unit: Unit, unitLabel?: string) =>
  `${trimAmount(amount)} ${unitLabel ?? (unit === "kg" ? "kg" : unit)}`;

// ---------- prices ----------
// A product's price is for 0.25 kg (or for one piece). The server uses the same rule to price an order.
export const priceUnits = (amount: number, unit: Unit) => (unit === "kg" ? amount / QUARTER : amount);

// Before discount
export const grossTotal = (price: number, amount: number, unit: Unit) => price * priceUnits(amount, unit);

// After the one percentage discount. discount is 0 to 100.
export const lineTotal = (price: number, amount: number, unit: Unit, discount = 0) =>
  grossTotal(price, amount, unit) * (1 - clampDiscount(discount) / 100);

export const clampDiscount = (discount: number) => Math.min(100, Math.max(0, Number(discount) || 0));

export const formatDate = (iso: string, locale?: string) =>
  new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
