import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar.json";
import en from "../locales/en.json";

// Static text for the storefront and the admin lives in src/locales/en.json and ar.json.
// Keys are flat strings (for example "cart.emptyText"), so the key separator is switched off.
// Product and category names come from the database; they will be translated there later
// (nameAr / descriptionAr), and until then the English text is shown.

export type Language = "ar" | "en";
export const LANGUAGE_KEY = "rakan-language";

export function storedLanguage(): Language {
  try {
    // The store has always opened in Arabic unless the shopper picked English.
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: storedLanguage(),
  fallbackLng: "en",
  supportedLngs: ["ar", "en"],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false }, // React already escapes
  initAsync: false, // both files are bundled, so the first render already has text
  react: { useSuspense: false },
});

export default i18n;
