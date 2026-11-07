import type { Unit } from "../types";
export const formatPrice = (n: number) => n.toFixed(2);
// kg items change in quarter-kilo steps, everything else by one
export const stepFor = (unit: Unit) => (unit === "kg" ? 0.25 : 1);
export const amountLabel = (amount: number, unit: Unit) =>
  unit === "kg" ? `${amount.toFixed(2)} kg` : `${amount} ${unit}`;

// A product's price is for 0.25 kg (or for one piece). The server uses the same rule to price an order.
export const lineTotal = (price: number, amount: number, unit: Unit) =>
  unit === "kg" ? price * (amount / 0.25) : price * amount;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
