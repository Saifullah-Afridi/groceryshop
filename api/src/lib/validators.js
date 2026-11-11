import { z } from "zod";

// People often mistype the end of a well-known address (gmail.cm, gmial.com). The mail is then lost,
// and the shopper waits for a code that never arrives. Catch it at sign-up and suggest the right domain.
const DOMAIN_FIXES = {
  "gmail.cm": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.om": "gmail.com", "gmail.comm": "gmail.com",
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmaill.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.cok": "gmail.com",
  "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "yahoo.cm": "yahoo.com", "yhoo.com": "yahoo.com",
  "hotmial.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotmail.cm": "hotmail.com", "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "outlook.cm": "outlook.com",
  "iclod.com": "icloud.com", "icloud.con": "icloud.com", "icloud.cm": "icloud.com",
};

// Returns the corrected address ("a@gmail.com") when the domain looks mistyped, otherwise null.
export function suggestEmailFix(email) {
  const [name, domain] = String(email).trim().toLowerCase().split("@");
  const fixed = DOMAIN_FIXES[domain];
  return name && fixed ? `${name}@${fixed}` : null;
}

// Shared rules, so every feature checks a phone number the same way.
export const phone = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[\d\s-]+$/.test(value) && digits >= 8 && digits <= 15;
}, "Enter a valid phone number");
