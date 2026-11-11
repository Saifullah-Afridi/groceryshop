import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { resendCustomerCode, verifyCustomerEmail } from "../../services/customerService";
import { FormField, inputClass } from "../admin/FormField";

const RESEND_SECONDS = 60;

interface Props {
  email: string;
  notice: string;
  onBack: () => void;
}

export function VerifyOtpForm({ email, notice, onBack }: Props) {
  const { signIn } = useCustomerAuth();
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS); // a code was just sent

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError(t("auth.errCode"));
    setError("");
    setBusy(true);
    try {
      signIn(await verifyCustomerEmail(email, code));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    try {
      await resendCustomerCode(email);
      setSeconds(RESEND_SECONDS);
      toast.info(t("auth.newCodeSent"));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">
        {notice || t("auth.sentCode")} <b className="text-ink" dir="ltr">{email}</b>. {t("auth.codeValid")}
      </p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{error}</p>}

      <FormField label={t("auth.codeLabel")}>
        <input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} h-12 text-center text-xl font-bold tracking-[0.5em]`}
          placeholder="000000"
        />
      </FormField>

      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-lg bg-brand font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? t("auth.checking") : t("auth.verifyBtn")}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-muted hover:text-ink">
          {t("auth.differentEmail")}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={seconds > 0}
          className="font-semibold text-brand hover:underline disabled:text-muted disabled:no-underline"
        >
          {seconds > 0 ? t("auth.resendIn", { seconds }) : t("auth.resend")}
        </button>
      </div>
    </form>
  );
}
