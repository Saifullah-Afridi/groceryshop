import { useRef } from "react";

import {
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Wheat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useShopData";
import { Container } from "./Container";
import { Skeleton } from "./Skeleton";
import { useLanguage } from "../context/LanguageContext";

const ICONS = {
  Carrot,
  Apple,
  Beef,
  Milk,
  CupSoda,
  Wheat,
};

export function CategoryGrid() {
  const { t, isArabic } = useLanguage();
  const scrollRef = useRef<HTMLUListElement>(null);

  const { data } = useProducts({});
  const { data: categories = [], isLoading } = useCategories();

  const countOf = (id: string) =>
    data?.filter((p) => p.categoryId === id).length;

  // Carousel navigation
  const scrollCategories = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section
      className={`relative isolate overflow-hidden py-14 sm:py-16 lg:py-20 ${isArabic ? "text-right" : "text-left"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Category Section Background Image */}
      <img
        src="/images/category-bg.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />

      {/* Soft overlay to keep the section bright */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#F5FAF7]/35" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00A878]/20 bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#008B65] shadow-sm backdrop-blur-sm">
              <Leaf size={15} />
              {t("home.categoriesBadge")}
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#103B30] sm:text-4xl lg:text-5xl">
              {t("home.categoriesTitle")}
              <br />
              <span className="text-[#00A878]">
                {t("home.categoriesSubtitle")}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#557168] sm:text-base">
              {t("home.categoriesDescription")}
            </p>
          </div>

          {/* Desktop Carousel Controls */}
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label={t("home.previousCategories")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm transition-all duration-300 hover:border-[#00A878] hover:bg-[#00A878] hover:text-white"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label={t("home.nextCategories")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#008F59] text-white shadow-md shadow-[#008F59]/20 transition-all duration-300 hover:bg-[#00A878] hover:shadow-lg"
            >
              <ChevronRight size={21} />
            </button>
          </div>
        </div>

        {/* Category Carousel */}
        <ul
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {/* Loading Skeletons */}
          {isLoading &&
            Array.from({ length: 6 }, (_, i) => (
              <li
                key={i}
                className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
              >
                <Skeleton className="h-[260px] rounded-2xl" />
              </li>
            ))}

          {/* Category Cards */}
          {!isLoading &&
            categories.map((c) => {
              const Icon = ICONS[c.icon as keyof typeof ICONS];
              const count = countOf(c.id);

              return (
                <li
                  key={c.id}
                  className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
                >
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="group relative block h-[260px] overflow-hidden rounded-2xl border border-[#DCEAE2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A878]/50 hover:shadow-xl hover:shadow-[#164B35]/10"
                  >
                    {/* Category Image */}
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(145deg, ${c.color || "#DFF5E9"}, #B7E5CC)`,
                        }}
                      />
                    )}

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#092D22]/85 via-[#092D22]/10 to-transparent transition-all duration-300 group-hover:from-[#092D22]/90" />

                    {/* Top Icon */}
                    {Icon && (
                      <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/90 text-[#008F59] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-[#00C995] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.8} />
                      </div>
                    )}

                    {/* Category Information */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white transition-colors duration-300 group-hover:text-[#55E5B6]">
                          {c.name}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-white/80">
                          {count !== undefined
                            ? `${count} products`
                            : "Explore products"}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#00C995] group-hover:bg-[#00C995] group-hover:text-[#073B2D]">
                        <ArrowRight
                          size={17}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
        </ul>

        {/* Mobile Carousel Controls */}
        <div className="mt-5 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            aria-label={t("home.previousCategories")}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm active:scale-95"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            onClick={() => scrollCategories("right")}
            aria-label={t("home.nextCategories")}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#008F59] text-white shadow-md active:scale-95"
          >
            <ChevronRight size={21} />
          </button>
        </div>
      </Container>
    </section>
  );
}
