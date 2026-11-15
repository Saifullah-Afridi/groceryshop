import { ChevronRight, Home, Package } from "lucide-react";
import { Link } from "react-router-dom";

export function OrdersHero() {
  const isArabic = document.documentElement.lang.toLowerCase().startsWith("ar");

  return (
    <section
      className="relative isolate flex min-h-[380px]  w-full items-center overflow-hidden bg-[#080F23] sm:min-h-[430px] lg:min-h-[460px]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/shop-hero.png"
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Same overlay as Home, Shop, and Contact Hero */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r from-[#080F23]/85 via-[#080F23]/50 to-[#080F23]/20 ${
          isArabic ? "[direction:rtl]" : ""
        }`}
      />

      {/* Same radial highlight */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

      {/* Hero Content */}
      <div className="mx-auto flex min-h-[380px] w-full max-w-[1600px] items-center px-5 py-30 sm:min-h-[430px] sm:px-12 lg:min-h-[460px] xl:px-30">
        <div className="w-full max-w-[760px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
            <Package size={17} />
            <span>
              {isArabic ? "تتبع طلباتك بسهولة" : "YOUR ORDER HISTORY"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            {isArabic ? (
              <span className="text-[#00C995]">طلباتي</span>
            ) : (
              <>
                My <span className="text-[#00C995]">Orders</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
            {isArabic
              ? "تابع توصيلاتك واطلع على كل ما طلبته."
              : "Track your deliveries and see everything you have ordered."}
          </p>

          {/* Breadcrumb */}
          <nav
            aria-label={isArabic ? "مسار التنقل" : "Breadcrumb"}
            className="mt-7 flex items-center gap-2 text-sm font-medium text-white/60"
          >
            <Link
              to="/"
              className="flex items-center gap-2 transition hover:text-[#00C995]"
            >
              <Home size={17} />
              <span>{isArabic ? "الرئيسية" : "Home"}</span>
            </Link>

            <ChevronRight
              size={15}
              className={`text-white/40 ${isArabic ? "rotate-180" : ""}`}
            />

            <span className="font-semibold text-[#00C995]">
              {isArabic ? "طلباتي" : "My Orders"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
