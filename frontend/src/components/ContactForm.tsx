import { CheckCircle2, Send } from "lucide-react";
import { useId, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { STORE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { buildMailtoLink, validateContact } from "../utils/contactMessage";
import type { ContactErrors, ContactValues } from "../utils/contactMessage";

const EMPTY_VALUES: ContactValues = { name: "", email: "", message: "" };

// The same input look used by the auth forms: tall, rounded, with a soft green focus ring
const FIELD_CLASS =
  "w-full rounded-xl border border-edge bg-white px-4 text-base outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";

// The attributes that connect an input to its label and to its error message
interface InputLinkProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

interface FieldProps {
  label: string;
  error?: string;
  children: (inputProps: InputLinkProps) => ReactNode;
}

// One label, its input, and the error text under it.
// The error sits outside the label, so the input's name stays "Your name" and the error is read as its description.
function Field({ label, error, children }: FieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const inputProps: InputLinkProps = { id: fieldId, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined };

  return (
    <div className="text-sm">
      <label htmlFor={fieldId} className="mb-2 block font-semibold text-[#123B2A]">{label}</label>
      {children(inputProps)}
      {error && <span id={errorId} role="alert" className="mt-1.5 block text-xs text-sale">{error}</span>}
    </div>
  );
}

export function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [opened, setOpened] = useState(false);

  // Keeps one field in step with what the visitor types
  const update = (field: keyof ContactValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  // Checks the fields, then opens the email app with the message ready
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateContact(values, { name: t("contact.errName"), email: t("contact.errEmail"), message: t("contact.errMessage") });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    window.location.href = buildMailtoLink(values, t("contact.mailSubject", { name: values.name.trim() }));
    setOpened(true);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-[#DCEAE1] bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#073B2B]">{t("contact.formTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("contact.formText")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("contact.name")} error={errors.name}>
          {(inputProps) => <input {...inputProps} value={values.name} onChange={update("name")} autoComplete="name" placeholder={t("contact.namePlaceholder")} className={`${FIELD_CLASS} h-12`} />}
        </Field>
        <Field label={t("contact.email")} error={errors.email}>
          {(inputProps) => <input {...inputProps} type="email" dir="ltr" value={values.email} onChange={update("email")} autoComplete="email" placeholder={t("contact.emailPlaceholder")} className={`${FIELD_CLASS} h-12`} />}
        </Field>
      </div>

      <Field label={t("contact.message")} error={errors.message}>
        {(inputProps) => <textarea {...inputProps} value={values.message} onChange={update("message")} rows={6} placeholder={t("contact.messagePlaceholder")} className={`${FIELD_CLASS} min-h-36 resize-y py-3 leading-6`} />}
      </Field>

      <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark">
        <Send size={18} className="rtl:-scale-x-100" />
        {t("contact.send")}
      </button>

      {/* Shown after the email app was opened, with a phone fallback for devices without one */}
      {opened && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-[#0B5D3B]">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{t("contact.opened")}</p>
            <p className="mt-1 text-xs text-[#45675A]">{t("contact.noMailApp", { phone: STORE.phone })}</p>
          </div>
        </div>
      )}
    </form>
  );
}
