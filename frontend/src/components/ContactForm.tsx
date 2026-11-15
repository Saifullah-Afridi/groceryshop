import { CheckCircle2, Send } from "lucide-react";
import { useId, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { sendContactMessage } from "../services/contactService";
import { validateContact } from "../utils/contactMessage";
import type { ContactErrors, ContactValues } from "../utils/contactMessage";

const EMPTY_VALUES: ContactValues = { name: "", email: "", message: "" };
const FIELD_CLASS =
  "w-full rounded-xl border border-edge bg-white px-4 text-base outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";

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

function Field({ label, error, children }: FieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const inputProps: InputLinkProps = {
    id: fieldId,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div className="text-sm">
      <label htmlFor={fieldId} className="mb-2 block font-semibold text-[#123B2A]">{label}</label>
      {children(inputProps)}
      {error && <span id={errorId} role="alert" className="mt-1.5 block text-xs text-sale">{error}</span>}
    </div>
  );
}

export function ContactForm() {
  const { t, isArabic } = useLanguage();
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const update = (field: keyof ContactValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setStatus("idle");
    setServerError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateContact(values, {
      name: t("contact.errName"),
      email: t("contact.errEmail"),
      message: t("contact.errMessage"),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setStatus("sent");
      setValues(EMPTY_VALUES);
      setErrors({});
    } catch (error) {
      setStatus("error");
      setServerError(error instanceof Error
        ? error.message
        : (isArabic ? "تعذر إرسال رسالتك. حاول مرة أخرى." : "Your message could not be sent. Please try again."));
    }
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

      <button type="submit" disabled={status === "sending"} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
        <Send size={18} className="rtl:-scale-x-100" />
        {status === "sending"
          ? (isArabic ? "جارٍ الإرسال..." : "Sending...")
          : t("contact.send")}
      </button>

      {status === "sent" && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-[#0B5D3B]">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{isArabic ? "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا." : "Your message has been sent successfully. Thank you for contacting us."}</p>
        </div>
      )}
      {status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
      )}
    </form>
  );
}
