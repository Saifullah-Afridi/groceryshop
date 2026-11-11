import { useState, type FormEvent } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { City, CityInput } from "../../types/order";
import { FormButtons, FormField, inputClass } from "./FormField";

interface Props {
  initial?: City;
  saving: boolean;
  error?: string;
  onSubmit: (input: CityInput) => void;
  onCancel: () => void;
}

export function CityForm({ initial, saving, error, onSubmit, onCancel }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(initial ? String(initial.fee) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!name.trim()) found.name = t("admin.cityf.errName");
    if (fee === "" || Number(fee) < 0) found.fee = t("admin.cityf.errFee");
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ name: name.trim(), fee: Number(fee), active });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{error}</p>}
      <FormField label={t("admin.cityf.name")} error={errors.name}>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Irbid" />
      </FormField>
      <FormField label={t("admin.cityf.fee")} error={errors.fee}>
        <input type="number" step="0.01" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={inputClass} />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[var(--color-brand)]" />
        {t("admin.cityf.active")}
      </label>
      <FormButtons saving={saving} onCancel={onCancel} />
    </form>
  );
}
