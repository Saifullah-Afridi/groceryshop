import { useState, type FormEvent } from "react";
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

export function CustomerForm({ initial, saving, error, onSubmit, onCancel }: Props) {
  const { t } = useLanguage();
  const [f, setF] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof f) => (value: string) => setF((current) => ({ ...current, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = f.phone.replace(/\D/g, "").length;
    const found: Record<string, string> = {};
    if (f.name.trim().length < 2) found.name = t("admin.uf.errName");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) found.email = t("auth.errEmail");
    if (!/^\+?[\d\s-]+$/.test(f.phone.trim()) || digits < 8 || digits > 15) found.phone = t("auth.errPhone");
    if (f.address.trim().length < 5) found.address = t("admin.uf.errAddress");
    if (!initial && f.password.length < 8) found.password = t("auth.errPassword");
    if (initial && f.password && f.password.length < 8) found.password = t("admin.uf.errPasswordEdit");
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({
      name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), address: f.address.trim(),
      ...(f.password && { password: f.password }),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fullName")} error={errors.name}>
          <input autoFocus value={f.name} onChange={(e) => set("name")(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label={t("phone")} error={errors.phone}>
          <input type="tel" value={f.phone} onChange={(e) => set("phone")(e.target.value)} className={inputClass} />
        </FormField>
      </div>
      <FormField label={t("email")} error={errors.email}>
        <input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label={t("address")} error={errors.address}>
        <textarea rows={2} value={f.address} onChange={(e) => set("address")(e.target.value)} className={`${inputClass} h-auto py-2`} />
      </FormField>
      <FormField label={initial ? t("admin.uf.newPassword") : t("password")} error={errors.password}>
        <input type="password" autoComplete="new-password" value={f.password} onChange={(e) => set("password")(e.target.value)} className={inputClass} />
      </FormField>
      <FormButtons saving={saving} onCancel={onCancel} />
    </form>
  );
}
