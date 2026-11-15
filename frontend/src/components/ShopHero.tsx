import { ChevronRight, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export function ShopHero() {
  const { isArabic } = useLanguage();

  return (
    <section className="relative isolate min-h-[380px] w-full overflow-hidden bg-[#080F23] pt-24 sm:min-h-[430px] lg:min-h-[460px]">
      {/* Full-width background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/shop-hero.png')",
        }}
      />

      {/* Same overlay treatment as Home Hero */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r from-[#080F23]/85 via-[#080F23]/50 to-[#080F23]/20 ${
          isArabic ? "[direction:rtl]" : ""
        }`}
      />

      {/* Same subtle radial highlight as Home Hero */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

      {/* Content container */}
      <div
        className={`relative mx-auto flex min-h-[380px] w-full max-w-[1600px] items-center px-5 py-12 sm:min-h-[430px] sm:px-12 lg:min-h-[460px] xl:px-30 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <div className="w-full max-w-[760px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
            <ShoppingBasket size={17} />
            <span>
              {isArabic ? "اكتشف منتجات ركان" : "EXPLORE THE RAKAN COLLECTION"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            {isArabic ? (
              <>
                احتياجاتك اليومية،
                <br />
                <span className="text-[#00C995]">كلها في مكان واحد.</span>
              </>
            ) : (
              <>
                Your Everyday Essentials.
                <br />
                <span className="text-[#00C995]">All in One Place.</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
            {isArabic
              ? "تصفح مجموعتنا من الخضروات والفواكه الطازجة ومنتجات الألبان والمخبوزات والمواد الغذائية اليومية."
              : "Browse our selection of fresh produce, dairy, bakery items, pantry staples, and everything you need for everyday living."}
          </p>

          {/* Breadcrumbs */}
          <nav
            aria-label={isArabic ? "مسار التنقل" : "Breadcrumb"}
            className="mt-7 flex items-center gap-2 text-sm font-medium text-white/60"
          >
            <Link to="/" className="transition hover:text-[#00C995]">
              {isArabic ? "الرئيسية" : "Home"}
            </Link>

            <ChevronRight
              size={15}
              className={`text-white/40 ${isArabic ? "rotate-180" : ""}`}
            />

            <span className="font-semibold text-[#00C995]">
              {isArabic ? "المتجر" : "Shop"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
