import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export function OrdersHero() {
  const isArabic = document.documentElement.lang.toLowerCase().startsWith("ar");

  return (
    <section
      className="relative isolate flex min-h-[340px] w-full items-center overflow-hidden bg-[#031D1A] sm:min-h-[380px] lg:min-h-[410px]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/shop-hero.png"
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Dark green overlay */}
      <div
        className={`absolute inset-0 -z-10 ${
          isArabic
            ? "bg-gradient-to-l from-[#031D1A]/95 via-[#031D1A]/75 to-[#031D1A]/15"
            : "bg-gradient-to-r from-[#031D1A]/95 via-[#031D1A]/75 to-[#031D1A]/15"
        }`}
      />

      <div className="absolute inset-0 -z-10 bg-[#031D1A]/10" />

      <div className="mx-auto w-full max-w-[1600px] px-5 py-32 sm:px-8 sm:py-36 lg:px-14 lg:py-40">
        <div className="max-w-[650px]">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {isArabic ? (
              <span className="text-[#00C98D]">طلباتي</span>
            ) : (
              <>
                My <span className="text-[#00C98D]">Orders</span>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-[540px] text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            {isArabic
              ? "تابع توصيلاتك واطلع على كل ما طلبته."
              : "Track your deliveries and see everything you have ordered."}
          </p>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mt-8 flex items-center gap-3 text-sm font-medium text-white/80 sm:text-base"
          >
            <Link
              to="/"
              className="flex items-center gap-2 transition-colors hover:text-[#00C98D]"
            >
              <Home size={19} />
              <span>{isArabic ? "الرئيسية" : "Home"}</span>
            </Link>

            <ChevronRight size={18} className="text-white/50 rtl:rotate-180" />

            <span className="font-semibold text-white">
              {isArabic ? "طلباتي" : "My Orders"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
