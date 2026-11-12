import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function ContactHero() {
  const { isArabic } = useLanguage();

  return (
    <section
      className="relative isolate flex min-h-[340px] w-full items-center overflow-hidden bg-[#031D1A] sm:min-h-[380px] lg:min-h-[410px]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/contact-hero.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Dark Green Overlay */}
      <div
        className={`absolute inset-0 -z-10 ${
          isArabic
            ? "bg-gradient-to-l from-[#031D1A]/90 via-[#031D1A]/60 to-[#031D1A]/20"
            : "bg-gradient-to-r from-[#031D1A]/90 via-[#031D1A]/60 to-[#031D1A]/20"
        }`}
      />

      {/* Additional Subtle Overlay */}
      <div className="absolute inset-0 -z-10 bg-[#031D1A]/10" />

      {/* Hero Content */}
      <div className="mx-auto w-full max-w-[1600px] px-5 py-30 sm:px-8 lg:px-14">
        <div className="max-w-[650px]">
          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {isArabic ? (
              <>
                تواصل <span className="text-[#00C98D]">معنا</span>
              </>
            ) : (
              <>
                Contact <span className="text-[#00C98D]">Us</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-[540px] text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            {isArabic
              ? "نحن هنا لمساعدتك. تواصل معنا إذا كان لديك أي سؤال أو تحتاج إلى الدعم."
              : "We're here to help. Get in touch with us for questions, support, or anything you need."}
          </p>

          {/* Accent Line */}
          <div className="mt-6 h-1.5 w-20 rounded-full bg-[#00C98D]" />

          {/* Breadcrumb */}
          <nav className="mt-8 flex items-center gap-3 text-sm font-medium text-white/80 sm:text-base">
            <Link
              to="/"
              className="flex items-center gap-2 transition-colors hover:text-[#00C98D]"
            >
              <Home size={19} />
              <span>{isArabic ? "الرئيسية" : "Home"}</span>
            </Link>

            <ChevronRight size={18} className="text-white/50 rtl:rotate-180" />

            <span className="font-semibold text-white">
              {isArabic ? "اتصل بنا" : "Contact"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
