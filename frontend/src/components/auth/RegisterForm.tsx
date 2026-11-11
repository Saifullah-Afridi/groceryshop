import { useState, type FormEvent } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { suggestEmailFix } from "../../utils/emailTypo";
import { registerCustomer } from "../../services/customerService";
import { FormField, inputClass } from "../admin/FormField";
import { PasswordField } from "./PasswordField";

interface Props {
  onLogin: () => void;
  onRegistered: (email: string) => void;
}

const validPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[\d\s-]+$/.test(value.trim()) && digits >= 8 && digits <= 15;
};

export function RegisterForm({ onLogin, onRegistered }: Props) {
  const { t } = useLanguage();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof f) => (value: string) => setF((current) => ({ ...current, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (f.name.trim().length < 2) found.name = t("auth.errName");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) found.email = t("auth.errEmail");
    else {
      const fix = suggestEmailFix(f.email);
      if (fix) found.email = t("auth.errEmailTypo", { suggestion: fix });
    }
    if (!validPhone(f.phone)) found.phone = t("auth.errPhone");
    if (f.password.length < 8) found.password = t("auth.errPassword");
    if (f.address.trim().length < 5) found.address = t("auth.errAddress");
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError("");
    setBusy(true);
    try {
      const { email } = await registerCustomer({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        password: f.password,
        address: f.address.trim(),
      });
      onRegistered(email);
    } catch (err) {
      setServerError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted">{t("auth.registerHint")}</p>
      {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{serverError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fullName")} error={errors.name}>
          <input autoFocus autoComplete="name" value={f.name} onChange={(e) => set("name")(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label={t("phone")} error={errors.phone}>
          <input
            type="tel"
            autoComplete="tel"
            value={f.phone}
            onChange={(e) => set("phone")(e.target.value)}
            className={inputClass}
            placeholder={t("checkout.phonePlaceholder")}
          />
        </FormField>
        <FormField label={t("email")} error={errors.email}>
          <input type="email" autoComplete="username" value={f.email} onChange={(e) => set("email")(e.target.value)} className={inputClass} />
        </FormField>
        <PasswordField
          value={f.password}
          onChange={set("password")}
          error={errors.password}
          hint={t("auth.passwordHint")}
          autoComplete="new-password"
        />
      </div>
      <FormField label={t("auth.deliveryAddress")} error={errors.address}>
        <textarea
          rows={3}
          autoComplete="street-address"
          value={f.address}
          onChange={(e) => set("address")(e.target.value)}
          className={`${inputClass} h-auto py-2`}
          placeholder={t("auth.addressPlaceholder")}
        />
      </FormField>

      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full rounded-lg bg-brand text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? t("auth.creating") : t("auth.createBtn")}
      </button>
      <p className="text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <button type="button" onClick={onLogin} className="font-semibold text-brand hover:underline">
          {t("auth.signInBtn")}
        </button>
      </p>
    </form>
  );
}
