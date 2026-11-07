import { useState, type FormEvent } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import type { ApiError } from "../../services/apiClient";
import { loginCustomer } from "../../services/customerService";
import { FormField, inputClass } from "../admin/FormField";
import { PasswordField } from "./PasswordField";

interface Props {
  onRegister: () => void;
  onNeedsVerify: (email: string, notice: string) => void;
}

export function LoginForm({ onRegister, onNeedsVerify }: Props) {
  const { signIn } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      signIn(await loginCustomer(email.trim(), password));
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        onNeedsVerify(email.trim().toLowerCase(), "Your email is not verified yet. We sent you a new code.");
        return;
      }
      setError(apiError.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">Sign in to add items to your cart and place orders.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">{error}</p>}

      <FormField label="Email">
        <input
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </FormField>
      <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />

      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-lg bg-brand font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-muted">
        New to Rakan?{" "}
        <button type="button" onClick={onRegister} className="font-semibold text-brand hover:underline">
          Create an account
        </button>
      </p>
    </form>
  );
}
