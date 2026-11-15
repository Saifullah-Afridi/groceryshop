import {
  Eye,
  EyeOff,
  Leaf,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Mail,
  LockKeyhole,
  LogIn,
} from "lucide-react";

import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { FormField, inputClass } from "../../components/admin/FormField";
import { STORE } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export function AdminLoginPage() {
  const { user, login } = useAuth();
  const { t, toggleLanguage, isArabic } = useLanguage();

  const from =
    (useLocation().state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in
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
    <main
      className="min-h-screen w-full bg-[#F5FAF7] lg:grid lg:grid-cols-2"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ================================================== */}
      {/* LEFT BRAND PANEL */}
      {/* ================================================== */}

      <section className="relative isolate flex min-h-[390px] flex-col justify-between overflow-hidden bg-[#062D25] px-6 py-8 text-white sm:px-10 sm:py-10 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16">
        {/* Background Image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/shop-hero.png')",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#03271F]/95 via-[#063D30]/85 to-[#021E19]/95" />

        {/* Green Highlight */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_75%,_rgba(0,201,149,0.18),_transparent_60%)]" />

        {/* Brand */}
        <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#078A49] text-xl font-extrabold text-white shadow-lg shadow-black/20 sm:h-12 sm:w-12">
            R
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {STORE.name}
          </span>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 my-12 max-w-[650px] lg:my-auto lg:py-16">
          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            {t("admin.login.h1a")}{" "}
            <span className="text-[#00C995]">{t("admin.login.h1b")}</span>{" "}
            {t("admin.login.h1c")}
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[520px] text-base leading-8 text-white/75 sm:text-lg">
            {t("admin.login.sub")}
          </p>

          {/* Green Accent */}
          <div className="mt-7 h-1.5 w-20 rounded-full bg-[#00C995]" />

          {/* Feature Items */}
          <div className="mt-10 grid max-w-[480px] grid-cols-3 gap-4 sm:gap-8">
            {/* Fresh Products */}
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#00C995]/15 text-white ring-1 ring-[#00C995]/10 sm:h-16 sm:w-16">
                <Leaf size={29} strokeWidth={1.8} />
              </div>

              <span className="mt-3 text-sm font-semibold leading-6 text-white sm:text-base">
                Fresh
                <br />
                Products
              </span>
            </div>

            {/* Secure Shopping */}
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#00C995]/15 text-white ring-1 ring-[#00C995]/10 sm:h-16 sm:w-16">
                <ShieldCheck size={29} strokeWidth={1.8} />
              </div>

              <span className="mt-3 text-sm font-semibold leading-6 text-white sm:text-base">
                Secure
                <br />
                Shopping
              </span>
            </div>

            {/* Fast Delivery */}
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#00C995]/15 text-white ring-1 ring-[#00C995]/10 sm:h-16 sm:w-16">
                <Truck size={29} strokeWidth={1.8} />
              </div>

              <span className="mt-3 text-sm font-semibold leading-6 text-white sm:text-base">
                Fast
                <br />
                Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="relative z-10 text-xs font-medium text-white/55">
          © 2026 {STORE.name}. All rights reserved.
        </p>
      </section>

      {/* ================================================== */}
      {/* RIGHT LOGIN PANEL */}
      {/* ================================================== */}

      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-[#F5FAF7] px-5 py-16 sm:px-10 lg:min-h-screen lg:px-12">
        {/* Decorative Background Shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00C995]/5 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#00C995]/10 blur-3xl"
        />

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="absolute end-5 top-5 z-20 cursor-pointer rounded-full border border-[#DCEAE2] bg-white px-5 py-2.5 text-sm font-bold text-[#064E3B] shadow-sm transition hover:border-[#078A49] hover:text-[#078A49] sm:end-8 sm:top-8"
        >
          {t("admin.switchLang")}
        </button>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[460px]">
          <div className="rounded-[28px] border border-[#E2EEE7] bg-white p-6 shadow-[0_20px_60px_rgba(6,78,59,0.10)] sm:p-9 lg:p-10">
            {/* Login Icon */}
            <div className="mx-auto -mt-1 mb-5 grid h-20 w-20 place-items-center rounded-full bg-[#E7F7EF] ring-8 ring-[#F3FBF6]">
              <ShoppingCart
                size={37}
                strokeWidth={1.8}
                className="text-[#078A49]"
              />
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#063B30]">
                {t("admin.login.title")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#84958C] sm:text-base">
                {t("admin.login.enter")}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={submit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-sale"
                >
                  {error}
                </p>
              )}

              {/* Email */}
              <FormField label={t("email")}>
                <div className="relative">
                  <Mail
                    size={20}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#80948A]"
                  />

                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} ps-12`}
                  />
                </div>
              </FormField>

              {/* Password */}
              <FormField label={t("password")}>
                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#80948A]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} ps-12 pe-12`}
                  />

                  {/* Password Visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                    className="absolute end-0 top-0 grid h-10 w-11 cursor-pointer place-items-center text-[#80948A] transition hover:text-[#078A49]"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </FormField>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={busy}
                className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#079B53] to-[#087C43] text-base font-bold text-white shadow-lg shadow-[#078A49]/15 transition duration-200 hover:-translate-y-0.5 hover:from-[#078A49] hover:to-[#056B39] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {busy ? (
                  t("auth.signingIn")
                ) : (
                  <>
                    <LogIn size={21} />
                    {t("auth.signInBtn")}
                  </>
                )}
              </button>
            </form>

            {/* Back to Store */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E3ECE6]" />

              <Link
                to="/"
                className="cursor-pointer whitespace-nowrap text-sm font-bold text-[#078A49] transition hover:text-[#056B39] hover:underline"
              >
                {t("admin.login.back")}
              </Link>

              <div className="h-px flex-1 bg-[#E3ECE6]" />
            </div>
          </div>

          {/* Bottom Note */}
          <p className="mt-6 text-center text-xs font-medium text-[#91A49A]">
            © 2026 {STORE.name}
          </p>
        </div>
      </section>
    </main>
  );
}
