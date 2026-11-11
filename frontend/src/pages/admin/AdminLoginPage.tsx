import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { FormField, inputClass } from "../../components/admin/FormField";
import { STORE } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export function AdminLoginPage() {
  const { user, login } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in: go straight to the dashboard (or the page they asked for).
  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWrong"));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel: the same hero photo and greens as the shop */}
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-forest p-12 text-white lg:flex">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('/images/shop-hero.png')" }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-forest/90 via-forest/80 to-forest-2/95" />

        <div className="flex items-center gap-3 text-2xl font-extrabold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-lg text-white shadow-lg shadow-black/20">R</span>
          {STORE.name}
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            {t("admin.login.h1a")} <span className="text-emerald">{t("admin.login.h1b")}</span> {t("admin.login.h1c")}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
            {t("admin.login.sub")}
          </p>
        </div>
        <p className="text-xs text-white/50">© 2026 {STORE.name}</p>
      </div>

      <div className="relative grid place-items-center bg-surface p-6">
        <button type="button" onClick={toggleLanguage} className="absolute end-4 top-4 rounded-full border border-edge bg-white px-4 py-2 text-sm font-semibold text-forest-2 transition hover:border-brand">{t("admin.switchLang")}</button>
        <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-edge bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-forest-2">{t("admin.login.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("admin.login.enter")}</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">
              {error}
            </p>
          )}

          <FormField label={t("email")}>
            <input
              type="email"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@gmail.com"
            />
          </FormField>

          <FormField label={t("password")}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pe-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                className="absolute end-0 top-0 grid h-10 w-11 place-items-center text-muted hover:text-black"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-lg bg-brand font-bold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? t("auth.signingIn") : t("auth.signInBtn")}
          </button>

          {import.meta.env.DEV && (
            <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted" dir="ltr">
              {t("admin.login.dev")}
            </p>
          )}
          <Link to="/" className="block text-center text-sm font-medium text-brand hover:underline">
            {t("admin.login.back")}
          </Link>
        </form>
      </div>
    </div>
  );
}
