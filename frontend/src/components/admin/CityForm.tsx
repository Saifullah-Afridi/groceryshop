import { useEffect, useState, type FormEvent } from "react";
import { Truck } from "lucide-react";

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

export function CityForm({
  initial,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t, isArabic } = useLanguage();

  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(initial ? String(initial.fee) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when changing between cities
  useEffect(() => {
    setName(initial?.name ?? "");
    setFee(initial ? String(initial.fee) : "");
    setActive(initial?.active ?? true);
    setErrors({});
  }, [initial]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const found: Record<string, string> = {};
    const numericFee = Number(fee);

    if (!name.trim()) {
      found.name = t("admin.cityf.errName");
    }

    if (fee.trim() === "" || !Number.isFinite(numericFee) || numericFee < 0) {
      found.fee = t("admin.cityf.errFee");
    }

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: name.trim(),
      fee: numericFee,
      active,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Server error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm font-medium text-sale">{error}</p>
        </div>
      )}

      {/* City name */}
      <FormField label={t("admin.cityf.name")} error={errors.name}>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          className={inputClass}
          placeholder="Irbid"
        />
      </FormField>

      {/* Delivery fee */}
      <FormField label={t("admin.cityf.fee")} error={errors.fee}>
        <input
          type="number"
          step="0.01"
          min="0"
          value={fee}
          onChange={(e) => {
            setFee(e.target.value);
            setErrors((prev) => ({ ...prev, fee: "" }));
          }}
          className={inputClass}
          placeholder="0.00"
        />
      </FormField>

      {/* City availability */}
      <div className="rounded-xl border border-edge bg-surface/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge bg-white text-brand">
              <Truck size={19} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-brand">
                {t("admin.cityf.active")}
              </p>

              <p className="text-xs leading-5 text-muted">
                {isArabic
                  ? "عند التفعيل، يمكن للعملاء اختيار هذه المدينة عند إتمام الطلب."
                  : "When enabled, shoppers can choose this city as their delivery destination during checkout."}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={t("admin.cityf.active")}
            onClick={() => setActive((value) => !value)}
            className={`
              relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer
              items-center rounded-full transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-brand
              focus:ring-offset-2
              ${active ? "bg-brand" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white
                shadow-sm transition-transform duration-200
                ${
                  active
                    ? isArabic
                      ? "-translate-x-1"
                      : "translate-x-6"
                    : isArabic
                      ? "-translate-x-6"
                      : "translate-x-1"
                }
              `}
            />
          </button>
        </div>

        <div className="mt-3 border-t border-edge pt-3">
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
              text-xs font-semibold
              ${
                active
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? "bg-green-600" : "bg-gray-400"
              }`}
            />

            {active
              ? isArabic
                ? "متاحة للعملاء"
                : "Available to shoppers"
              : isArabic
                ? "غير متاحة للعملاء"
                : "Unavailable to shoppers"}
          </span>
        </div>
      </div>

      {/* Form buttons */}
      <div className="border-t border-edge pt-4">
        <FormButtons saving={saving} onCancel={onCancel} />
      </div>
    </form>
  );
}
