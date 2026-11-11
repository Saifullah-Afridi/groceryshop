import type { TranslationKey } from "../context/LanguageContext";
import type { OrderStatus } from "../types/order";

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
// The steps a normal order goes through (a cancelled order is shown separately)
export const TRACKER_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

// The words for each status live in the locale files (status.PENDING ...), so they follow the language.
export const statusKey = (status: OrderStatus) => `status.${status}` as TranslationKey;

export const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};
