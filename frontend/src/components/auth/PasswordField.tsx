import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { FormField, inputClass } from "../admin/FormField";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete: "current-password" | "new-password";
}

// A password input with a show/hide button.
export function PasswordField({ label, value, onChange, error, hint, autoComplete }: Props) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  return (
    <FormField label={label ?? t("password")} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`${inputClass} pe-11`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          className="absolute end-0 top-0 grid h-10 w-11 place-items-center text-muted hover:text-ink"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </FormField>
  );
}
