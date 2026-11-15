import { ChevronRight, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export function ShopHero() {
  const { isArabic } = useLanguage();

  return (
    <section className="relative isolate min-h-[380px] w-full overflow-hidden bg-[#031D1A] pt-24 sm:min-h-[430px] lg:min-h-[460px]">
      {/* Full-width background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/shop-hero.png')",
        }}
      />

      {/* Dark overlay */}
      <div
        className={`absolute inset-0 -z-10 ${
          isArabic
            ? "bg-gradient-to-l from-[#031D1A]/95 via-[#031D1A]/80 to-[#031D1A]/20"
            : "bg-gradient-to-r from-[#031D1A]/95 via-[#031D1A]/80 to-[#031D1A]/20"
        }`}
      />

      {/* Subtle additional darkening */}
      <div className="absolute inset-0 -z-10 bg-[#031D1A]/10" />

      {/* Content container */}
      <div
        className={`mx-auto flex min-h-[380px] w-full max-w-[1600px] items-center px-5 py-12 sm:min-h-[430px] sm:px-12 lg:min-h-[460px] lg:px-20 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[600px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C98D]/30 bg-[#003F35]/60 px-4 py-2 text-xs font-semibold tracking-wide text-[#00D6A0] backdrop-blur-sm">
            <ShoppingBasket size={15} />

            <span>
              {isArabic ? "اكتشف منتجات ركان" : "EXPLORE THE RAKAN COLLECTION"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isArabic ? (
              <>
                احتياجاتك اليومية،
                <br />
                <span className="text-[#00C98D]">كلها في مكان واحد.</span>
              </>
            ) : (
              <>
                Your Everyday Essentials.
                <br />
                <span className="text-[#00C98D]">All in One Place.</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-[520px] text-sm leading-7 text-white/75 sm:text-base">
            {isArabic
              ? "تصفح مجموعتنا من الخضروات والفواكه الطازجة ومنتجات الألبان والمخبوزات والمواد الغذائية اليومية."
              : "Browse our selection of fresh produce, dairy, bakery items, pantry staples, and everything you need for everyday living."}
          </p>

          {/* Breadcrumbs */}
          <nav
            aria-label={isArabic ? "مسار التنقل" : "Breadcrumb"}
            className="mt-7 flex items-center gap-2 text-sm"
          >
            <Link
              to="/"
              className="text-white/60 transition hover:text-[#00C98D]"
            >
              {isArabic ? "الرئيسية" : "Home"}
            </Link>

            <ChevronRight
              size={15}
              className={`text-white/40 ${isArabic ? "rotate-180" : ""}`}
            />

            <span className="font-semibold text-[#00C98D]">
              {isArabic ? "المتجر" : "Shop"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
