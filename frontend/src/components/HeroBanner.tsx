import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export function HeroBanner() {
  const { t, isArabic } = useLanguage();

  return (
    <section className="relative isolate min-h-[650px] overflow-hidden bg-[#080F23] sm:min-h-[700px] xl:min-h-[720px]">
      <img
        src="/images/hero-groceries.png"
        alt={t("hero.description")}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#080F23]/85 via-[#080F23]/50 to-[#080F23]/20 ${isArabic ? "[direction:rtl]" : ""}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

      <div
        className={`relative mx-auto flex min-h-[650px] max-w-[1600px] items-center px-5 py-40 sm:min-h-[700px] sm:px-12 xl:min-h-[720px] xl:px-30 ${isArabic ? "text-right" : "text-left"}`}
      >
        <div className="w-full max-w-[760px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
            <Leaf size={17} /> {t("hero.badge")}
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            {t("hero.title1")}
            <br />
            <span className="text-[#00C995]">{t("hero.title2")}</span>
            <br />
            {t("hero.title3")}
          </h1>
          <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
            {t("hero.description")}
          </p>
          <div className="mt-9 flex flex-col items-start gap-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-[#00C995] px-8 py-4 text-base font-bold text-[#071B20] shadow-lg shadow-[#00C995]/20 transition-all duration-200 hover:-translate-y-1 hover:bg-[#20E2AE] hover:shadow-xl"
            >
              {t("hero.shopNow")}
              <ArrowRight
                size={20}
                className={`transition-transform duration-200 group-hover:translate-x-1 ${isArabic ? "rotate-180" : ""}`}
              />
            </Link>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-2">
                <Leaf size={25} className="shrink-0 text-[#00C995]" />
                <span className="text-sm font-semibold leading-tight text-white">
                  100%
                  <br />
                  {t("hero.dailyFresh")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={25} className="shrink-0 text-[#00C995]" />
                <span className="text-sm font-semibold leading-tight text-white">
                  {t("hero.secure")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={27} className="shrink-0 text-[#00C995]" />
                <span className="text-sm font-semibold leading-tight text-white">
                  {t("hero.fastDelivery")}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-9 flex items-center gap-2 text-sm font-medium text-white/60">
            <span className="h-2 w-2 rounded-full bg-[#00C995]" />
            {t("hero.locationLine")}
          </div>
        </div>
      </div>
    </section>
  );
}
