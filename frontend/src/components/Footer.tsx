import { Container } from "./Container";
import { STORE } from "../config";
import {
  MapPin,
  Phone,
  Clock,
  CreditCard,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useLocation } from "react-router-dom";

interface FooterProps {
  variant?: "light" | "dark";
}

export function Footer({ variant = "light" }: FooterProps) {
  const { t, isArabic } = useLanguage();
  const { pathname } = useLocation();

  // Automatically enable dark footer on these pages
  const isDarkPage =
    pathname.startsWith("/shop") ||
    pathname === "/contact" ||
    pathname === "/orders";

  const isDark = variant === "dark" || isDarkPage;

  const theme = {
    mainBackground: isDark ? "bg-[#031D1A]" : "bg-[#F5FAF7]",
    border: isDark ? "border-white/10" : "border-[#DCEAE1]",
    brandTitle: isDark ? "text-white" : "text-[#073B2B]",
    heading: isDark ? "text-white" : "text-[#073B2B]",
    body: isDark ? "text-white/65" : "text-[#45675A]",
    itemTitle: isDark ? "text-white" : "text-[#173D30]",
    accent: isDark ? "text-[#00C98D]" : "text-[#008F59]",
    accentHover: isDark ? "hover:text-[#00E6A0]" : "hover:text-[#073B2B]",
    iconContainer: isDark
      ? "border-white/10 bg-white/5 text-[#00C98D]"
      : "border-[#CDEBDD] bg-white/85 text-[#008F59]",
    badge: isDark
      ? "border-[#00C98D]/25 bg-[#00C98D]/10 text-[#00C98D]"
      : "border-[#BFE6D5] bg-white/80 text-[#008F59]",
    badgeDot: isDark ? "bg-[#00C98D]" : "bg-[#00A878]",
  };

  const item = (Icon: typeof MapPin, title: string, description: string) => (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconContainer}`}
      >
        <Icon size={17} />
      </div>

      <div>
        <p className={`text-sm font-semibold ${theme.itemTitle}`}>{title}</p>

        <p className={`mt-1 text-sm leading-6 ${theme.body}`}>{description}</p>
      </div>
    </div>
  );

  return (
    <footer dir={isArabic ? "rtl" : "ltr"}>
      <div
        className={`relative isolate overflow-hidden border-t ${theme.border} ${theme.mainBackground}`}
      >
        {/* Footer Background Image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-no-repeat"
          style={{
            backgroundImage: "url('/images/footer-bg.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        />

        {/* Footer Overlay */}
        {isDark ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#031D1A] via-[#031D1A]/90 to-[#031D1A]/65"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[#F5FAF7]/25"
          />
        )}

        <Container className="relative z-10">
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
            {/* Brand Section */}
            <div className="max-w-sm">
              <a href="/" className="inline-block">
                <h3
                  className={`text-3xl font-extrabold tracking-tight ${theme.brandTitle}`}
                >
                  {STORE.name}
                  <span className={theme.accent}>.</span>
                </h3>
              </a>

              <p className={`mt-4 text-sm leading-7 ${theme.body}`}>
                {t("footer.brandDescription")}
              </p>

              <p className={`mt-3 text-sm leading-7 ${theme.body}`}>
                {t("footer.brandPromise")}
              </p>

              <div
                className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-sm ${theme.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${theme.badgeDot}`} />
                {t("footer.badge")}
              </div>
            </div>

            {/* Store Information */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                {t("footer.storeInfo")}
              </h4>

              <div className="mt-5 space-y-5">
                {item(MapPin, t("footer.location"), t("footer.address"))}

                {item(Clock, t("footer.openingHours"), t("footer.hours"))}
              </div>
            </div>

            {/* Delivery & Payment */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                {t("footer.deliveryPayment")}
              </h4>

              <div className="mt-5 space-y-5">
                {item(
                  Truck,
                  t("footer.deliveryAreas"),
                  t("footer.deliveryAreaText"),
                )}

                {item(
                  CreditCard,
                  t("footer.paymentMethods"),
                  t("footer.paymentText"),
                )}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                {t("footer.support")}
              </h4>

              <p className={`mt-5 text-sm leading-6 ${theme.body}`}>
                {t("footer.supportText")}
              </p>

              <a
                href={`tel:${STORE.phone}`}
                className={`mt-4 inline-flex items-center gap-2 text-base font-bold ${theme.accent} transition-colors ${theme.accentHover}`}
              >
                <Phone size={17} />
                {STORE.phone}
                <ArrowUpRight size={15} />
              </a>

              <p className={`mt-4 text-sm leading-6 ${theme.body}`}>
                {t("footer.supportMore")}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/10 bg-[#073B2B]">
        <Container>
          <div className="flex flex-col gap-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {STORE.name}. {t("footer.rights")}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <a href="/privacy" className="transition-colors hover:text-white">
                {t("footer.privacy")}
              </a>

              <a href="/terms" className="transition-colors hover:text-white">
                {t("footer.terms")}
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
