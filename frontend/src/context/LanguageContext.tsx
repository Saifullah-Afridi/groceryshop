import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import i18n, { LANGUAGE_KEY, type Language } from "../i18n";
import type en from "../locales/en.json";
import { formatDate, formatPrice } from "../utils/format";

export type { Language };

// "cart.items_one" and "cart.items_other" are plural forms of the one key "cart.items".
type PluralSuffix = "zero" | "one" | "two" | "few" | "many" | "other";
type StripPlural<K> = K extends `${infer Base}_${PluralSuffix}` ? Base : K;
export type TranslationKey = StripPlural<keyof typeof en>;
export type TranslateVars = Record<string, string | number>;

interface ContextValue {
  language: Language;
  isArabic: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
  /** 12.5 -> "12.50 JOD" / "12.50 د.أ" */
  money: (amount: number) => string;
  /** Localised unit name: "kg" / "كغ" */
  unitName: (unit: string) => string;
  /** Date and time in the active language, always with 0-9 digits */
  date: (iso: string) => string;
}

const LanguageContext = createContext<ContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n: instance } = useTranslation();
  const language: Language = instance.language?.toLowerCase().startsWith("en") ? "en" : "ar";

  // Keep <html lang>, direction, the page title and the saved choice in step with the language.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
    root.dataset.language = language;
    document.title = i18n.t("siteTitle");
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* storage may be unavailable */
    }
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) return;
      // Save synchronously before changing language so a fast refresh cannot
      // race the React effect and restore the previous locale.
      try {
        localStorage.setItem(LANGUAGE_KEY, next);
      } catch {
        // Storage may be unavailable.
      }
      const root = document.documentElement;
      root.classList.add("language-switch-no-motion");
      void i18n.changeLanguage(next).finally(() => {
        window.setTimeout(() => root.classList.remove("language-switch-no-motion"), 0);
      });
    },
    [language],
  );

  const value = useMemo<ContextValue>(() => {
    const t = (key: TranslationKey, vars?: TranslateVars) =>
      String(i18n.t(key, { ...vars, lng: language }));
    return {
      language,
      isArabic: language === "ar",
      setLanguage,
      toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
      t,
      money: (amount) => `${formatPrice(amount)} ${t("currency")}`,
      unitName: (unit) => t(`unit.${unit}` as TranslationKey),
      date: (iso) => formatDate(iso, language === "ar" ? "ar-u-nu-latn" : "en-GB"),
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
