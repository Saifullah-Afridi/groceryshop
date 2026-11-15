import { Link } from "react-router-dom";
import { Home, ChevronRight, MessageCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function ContactHero() {
  const { isArabic } = useLanguage();

  return (
    <section
      className="relative isolate flex min-h-[380px] pt-24 w-full items-center overflow-hidden bg-[#080F23] sm:min-h-[430px] lg:min-h-[460px]"
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

      {/* Same overlay as Home and Shop Hero */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r from-[#080F23]/85 via-[#080F23]/50 to-[#080F23]/20 ${
          isArabic ? "[direction:rtl]" : ""
        }`}
      />

      {/* Same radial highlight */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

      {/* Hero Content */}
      <div className="mx-auto flex min-h-[380px] w-full max-w-[1600px] items-center px-5 py-12 sm:min-h-[430px] sm:px-12 lg:min-h-[460px] xl:px-30">
        <div className="w-full max-w-[760px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
            <MessageCircle size={17} />
            <span>{isArabic ? "نحن هنا لمساعدتك" : "WE'RE HERE TO HELP"}</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            {isArabic ? (
              <>
                تواصل <span className="text-[#00C995]">معنا</span>
              </>
            ) : (
              <>
                Contact <span className="text-[#00C995]">Us</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
            {isArabic
              ? "نحن هنا لمساعدتك. تواصل معنا إذا كان لديك أي سؤال أو تحتاج إلى الدعم."
              : "We're here to help. Get in touch with us for questions, support, or anything you need."}
          </p>

          {/* Breadcrumb */}
          <nav className="mt-7 flex items-center gap-2 text-sm font-medium text-white/60">
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
              {isArabic ? "اتصل بنا" : "Contact"}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
