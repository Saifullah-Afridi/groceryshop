import type { ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";

// Use this class on every input, select and textarea so forms look the same.
export const inputClass = "h-10 w-full rounded-lg border border-edge bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

export function FormField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-sale">{error}</span>}
    </label>
  );
}

export function FormButtons({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-edge px-4 text-sm font-semibold transition hover:bg-surface">{t("cancel")}</button>
      <button type="submit" disabled={saving} className="h-10 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-50">
        {saving ? t("saving") : t("save")}
      </button>
    </div>
  );
}
