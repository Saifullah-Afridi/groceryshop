import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSettings,
} from "../../services/authService";

export function AdminConfigurationPage() {
  const { updateEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    getAdminSettings()
      .then((settings: AdminSettings) => {
        if (active) setEmail(settings.email);
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message || "Could not load administrator settings.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    setSaving(true);

    try {
      const result = await updateAdminSettings({
        currentPassword,
        email,
        password,
      });

      setEmail(result.email);
      updateEmail(result.email);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

      setSuccess(
        `${result.message} Use the new email and password next time you log in.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#718078]">
        <Loader2 className="me-2 animate-spin" size={18} />
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <p className="text-sm text-[#718078]">
          Manage your administrator login details and account security.
        </p>
      </div>

      <section className="w-full overflow-hidden rounded-2xl border border-[#E1EAE4] bg-white shadow-[0_4px_20px_rgba(10,74,42,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#EAF0EC] px-5 py-5 sm:px-8">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF5ED] text-[#0A6B3C]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-extrabold text-[#123B2A]">
              Administrator account
            </h2>

            <p className="mt-0.5 text-xs text-[#849188]">
              Update the email address and password used to access the admin
              panel.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5 sm:p-8">
          <div className="w-full">
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-bold text-[#294638]"
            >
              Administrator email
            </label>

            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#8A9A90]"
                size={18}
              />

              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#DCE7DF] bg-white py-3 ps-10 pe-4 text-sm text-[#173D2B] outline-none transition focus:border-[#0D8A4B] focus:ring-4 focus:ring-[#0D8A4B]/10"
              />
            </div>
          </div>

          <div className="w-full rounded-xl border border-[#E5EEE8] bg-[#F8FBF9] p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[#294638]">
              <KeyRound size={17} className="text-[#0D8A4B]" />
              Password security
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-[#52665A]"
                >
                  Current password <span className="text-[#D3222A]">*</span>
                </label>

                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE7DF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D8A4B] focus:ring-4 focus:ring-[#0D8A4B]/10"
                />
              </div>

              <div className="grid w-full gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-[#52665A]"
                  >
                    New password <span className="text-[#D3222A]">*</span>
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE7DF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D8A4B] focus:ring-4 focus:ring-[#0D8A4B]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-[#52665A]"
                  >
                    Confirm new password{" "}
                    <span className="text-[#D3222A]">*</span>
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE7DF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D8A4B] focus:ring-4 focus:ring-[#0D8A4B]/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={17} />
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-5 text-green-800"
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
              {success}
            </div>
          )}

          <div className="flex justify-end border-t border-[#EAF0EC] pt-5">
            <button
              type="submit"
              disabled={
                saving ||
                !email ||
                !currentPassword ||
                !password ||
                !confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A4A2A] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0D6B3C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving changes..." : "Save configuration"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
