import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

import { useProducts } from "../hooks/useProducts";
import { Container } from "./Container";
import { Message } from "./Message";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./Skeleton";
import { useLanguage } from "../context/LanguageContext";

const HOME_PRODUCT_COUNT = 16;

export function FeaturedProducts() {
  const { t, isArabic } = useLanguage();
  const { data, isLoading, isError, refetch } = useProducts({
    sort: "rating",
  });

  const featuredProducts = data?.slice(0, HOME_PRODUCT_COUNT) ?? [];

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      className={`relative isolate overflow-hidden bg-[#073B2B] pt-16 pb-24 sm:pt-20 sm:pb-28 lg:pt-24 ${isArabic ? "text-right" : "text-left"}`}
    >
      {/* Top Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[380px] overflow-hidden sm:h-[440px]"
      >
        <img
          src="/images/featured-top-bg.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#073B2B]/10 via-[#073B2B]/30 to-[#073B2B]" />
      </div>

      {/* Bottom Grocery Basket Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[220px] overflow-hidden sm:h-[280px] lg:h-[320px]"
      >
        <img
          src="/images/featured-bottom-bg.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-right"
        />
        {/* Top Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#073B2B] via-[#073B2B]/30 to-transparent" />

        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-[#073B2B]/35" />
      </div>

      {/* Section Content */}
      <Container className="relative z-10">
        {/* Section Heading */}
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/15 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#B5FFE5]">
            <Star size={14} className="fill-[#00C995] text-[#00C995]" />
            {t("home.featuredBadge")}
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("home.featuredTitle")}
            <br />
            <span className="text-[#35DB9C]">{t("home.featuredSubtitle")}</span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#C6DCCF] sm:text-base">
            {t("home.featuredDescription")}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: HOME_PRODUCT_COUNT }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Message
              title={t("couldNotLoad")}
              text={t("checkConnection")}
              action={{
                label: t("tryAgain"),
                onClick: () => refetch(),
              }}
            />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && featuredProducts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-16 text-center">
            <Star size={36} className="mx-auto mb-4 text-[#35DB9C]" />

            <h3 className="text-lg font-bold text-white">
              {t("home.noFeatured")}
            </h3>

            <p className="mt-2 text-sm text-[#C6DCCF]">
              {t("home.featuredSoon")}
            </p>
          </div>
        )}

        {/* Explore All Products */}
        {!isError && (
          <div className="mt-12 flex justify-center sm:mt-14">
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#00C995] px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00C995] hover:text-[#073B2B] hover:shadow-lg hover:shadow-[#00C995]/20"
            >
              {t("home.exploreAll")}
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
