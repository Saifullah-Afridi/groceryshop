import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
export function PasswordField({ label = "Password", value, onChange, error, hint, autoComplete }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 grid h-10 w-11 place-items-center text-muted hover:text-ink"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </FormField>
  );
}
