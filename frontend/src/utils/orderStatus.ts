import type { TranslationKey } from "../context/LanguageContext";
import type { OrderStatus } from "../types/order";

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];
// The steps a normal order goes through (a cancelled order is shown separately)
export const TRACKER_STEPS: OrderStatus[] = ["PENDING", "ON_THE_WAY", "DELIVERED"];

// The words for each status live in the locale files (status.PENDING ...), so they follow the language.
export const statusKey = (status: OrderStatus) => `status.${status}` as TranslationKey;

export const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ON_THE_WAY: "bg-cyan-50 text-cyan-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};
