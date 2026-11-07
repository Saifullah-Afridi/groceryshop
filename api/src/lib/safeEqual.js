import { timingSafeEqual } from "node:crypto";

// Compare two strings without leaking how many characters matched.
export function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
