import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import type { AdminCustomer, CustomerInput } from "../../types/customer";
import { FormButtons, FormField, inputClass } from "./FormField";

interface Props {
  initial?: AdminCustomer;
  saving: boolean;
  error?: string;
  onSubmit: (input: CustomerInput) => void;
  onCancel: () => void;
}

export function CustomerForm({
  initial,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t, isArabic, language } = useLanguage();

  const [f, setF] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial ? (language === "ar" ? (initial.addressAr || initial.address) : initial.address) : "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setF({
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      address: initial ? (language === "ar" ? (initial.addressAr || initial.address) : initial.address) : "",
      password: "",
    });

    setErrors({});
    setShowPassword(false);
  }, [initial, language]);

  const set = (key: keyof typeof f) => (value: string) => {
    setF((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const digits = f.phone.replace(/\D/g, "").length;
    const found: Record<string, string> = {};

    if (f.name.trim().length < 2) {
      found.name = t("admin.uf.errName");
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) {
      found.email = t("auth.errEmail");
    }

    if (!/^\+?[\d\s-]+$/.test(f.phone.trim()) || digits < 8 || digits > 15) {
      found.phone = t("auth.errPhone");
    }

    if (f.address.trim().length < 5) {
      found.address = t("admin.uf.errAddress");
    }

    if (!initial && f.password.length < 8) {
      found.password = t("auth.errPassword");
    }

    if (initial && f.password && f.password.length < 8) {
      found.password = t("admin.uf.errPasswordEdit");
    }

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      address: f.address.trim(),
      language,
      ...(f.password && { password: f.password }),
    });
  };

  const fieldClass = `${inputClass} h-11`;

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Server error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-medium text-sale">{error}</p>
        </div>
      )}

      {/* Name and phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fullName")} error={errors.name}>
          <input
            autoFocus
            type="text"
            autoComplete="name"
            value={f.name}
            onChange={(e) => set("name")(e.target.value)}
            className={fieldClass}
            placeholder={isArabic ? "" : "Customer name"}
          />
        </FormField>

        <FormField label={t("phone")} error={errors.phone}>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            value={f.phone}
            onChange={(e) => set("phone")(e.target.value)}
            className={fieldClass}
            placeholder="07X XXX XXXX"
          />
        </FormField>
      </div>

      {/* Email */}
      <FormField label={t("email")} error={errors.email}>
        <input
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={(e) => set("email")(e.target.value)}
          className={fieldClass}
          placeholder="customer@example.com"
        />
      </FormField>

      {/* Address */}
      <FormField label={t("address")} error={errors.address}>
        <textarea
          rows={3}
          autoComplete="street-address"
          value={f.address}
          onChange={(e) => set("address")(e.target.value)}
          className={`
            ${inputClass}
            min-h-[100px] resize-y py-3
          `}
          placeholder={isArabic ? "" : "Enter customer address"}
        />
      </FormField>

      {/* Password */}
      <div className="border-t border-edge pt-5">
        <FormField
          label={initial ? t("admin.uf.newPassword") : t("password")}
          error={errors.password}
        >
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={f.password}
              onChange={(e) => set("password")(e.target.value)}
              className={`${fieldClass} ${isArabic ? "pl-11" : "pr-11"}`}
              placeholder={
                initial
                  ? isArabic
                    ? ""
                    : "Leave blank to keep current password"
                  : isArabic
                    ? ""
                    : "Enter a password"
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className={`
                absolute top-1/2 -translate-y-1/2
                grid h-8 w-8 place-items-center
                rounded-md text-muted
                transition-colors duration-200
                hover:bg-surface hover:text-brand
                focus:outline-none focus:ring-2 focus:ring-brand
                ${isArabic ? "left-2" : "right-2"}
              `}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-muted">
            {initial
              ? isArabic
                ? "اترك الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور."
                : "Leave this field empty if you don't want to change the password."
              : isArabic
                ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
                : "Password must contain at least 8 characters."}
          </p>
        </FormField>
      </div>

      {/* Form actions */}
      <div className="border-t border-edge pt-4">
        <FormButtons saving={saving} onCancel={onCancel} />
      </div>
    </form>
  );
}
