// Same list as the API (api/src/lib/validators.js). Catches "gmail.cm" before an email is sent into the void.
const DOMAIN_FIXES: Record<string, string> = {
  "gmail.cm": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.om": "gmail.com", "gmail.comm": "gmail.com",
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmaill.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.cok": "gmail.com",
  "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "yahoo.cm": "yahoo.com", "yhoo.com": "yahoo.com",
  "hotmial.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotmail.cm": "hotmail.com", "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "outlook.cm": "outlook.com",
  "iclod.com": "icloud.com", "icloud.con": "icloud.com", "icloud.cm": "icloud.com",
};

/** "a@gmail.cm" -> "a@gmail.com". Returns null when nothing looks wrong. */
export function suggestEmailFix(email: string): string | null {
  const [name, domain] = email.trim().toLowerCase().split("@");
  const fixed = DOMAIN_FIXES[domain ?? ""];
  return name && fixed ? `${name}@${fixed}` : null;
}
