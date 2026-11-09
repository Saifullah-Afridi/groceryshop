const endpoint = (
  process.env.LIBRETRANSLATE_URL || "http://localhost:5000"
).replace(/\/$/, "");
const apiKey = process.env.LIBRETRANSLATE_API_KEY;

export async function detectLanguage(text) {
  if (!text?.trim()) return "en";
  try {
    const response = await fetch(`${endpoint}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, ...(apiKey ? { api_key: apiKey } : {}) }),
    });
    if (!response.ok)
      throw new Error(`Language detection failed (${response.status})`);
    const data = await response.json();
    return data?.[0]?.language === "ar" ? "ar" : "en";
  } catch (error) {
    // Arabic Unicode detection is a safe fallback if detection is unavailable.
    if (/[\\u0600-\\u06FF]/.test(text)) return "ar";
    throw error;
  }
}

export async function translateText(text, source, target) {
  if (!text?.trim() || source === target) return text || "";
  const response = await fetch(`${endpoint}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: "text",
      ...(apiKey ? { api_key: apiKey } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Translation failed (${response.status})`);
  const data = await response.json();
  if (!data?.translatedText)
    throw new Error("Translation service returned an empty result");
  return data.translatedText;
}

export async function bilingualText(text) {
  const source = await detectLanguage(text);
  const target = source === "ar" ? "en" : "ar";
  const translated = await translateText(text, source, target);
  return source === "ar"
    ? { en: translated, ar: text }
    : { en: text, ar: translated };
}
