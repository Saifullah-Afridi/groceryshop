import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { Message } from "../components/Message";
import { ProductGrid, ProductGridSkeleton } from "../components/ProductGrid";

import { ShopHero } from "../components/ShopHero";
import { ShopFilters } from "../components/ShopFilters";

import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useShopData";
import { useLanguage } from "../context/LanguageContext";

import type { ProductQuery } from "../types";

export function ShopPage() {
  const [params, setParams] = useSearchParams();

  const { isArabic, t } = useLanguage();
  const { data: categories = [] } = useCategories();

  // URL Filters
  const selectedCategory = params.get("category");
  const offersOnly = params.get("offers") === "1";
  const searchQuery = params.get("q") ?? "";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [selectedCategory, searchQuery]);

  // Product Query
  const query: ProductQuery = {
    category: selectedCategory ?? undefined,
    q: searchQuery || undefined,
    offersOnly: offersOnly || undefined,
  };

  const { data, isLoading, isError, refetch } = useProducts(query);

  // Update URL Parameters
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setParams(next, { replace: true });
  };

  // Selected Category
  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory,
  );

  // Page Heading
  const pageTitle = searchQuery
    ? isArabic
      ? `نتائج البحث عن "${searchQuery}"`
      : `Results for "${searchQuery}"`
    : selectedCategoryData
      ? isArabic
        ? selectedCategoryData.nameAr || selectedCategoryData.name
        : selectedCategoryData.name
      : isArabic
        ? "جميع المنتجات"
        : "All Products";

  // Clear Filters
  const clearFilters = () => {
    const next = new URLSearchParams(params);

    next.delete("category");
    next.delete("offers");

    setParams(next, { replace: true });
  };

  return (
    <main className="pb-16">
      {/* Shop Hero */}
      <ShopHero />

      <div className="mx-auto mt-10 w-full max-w-[1600px] px-5 sm:px-8 lg:px-14">
        <section id="shop-products" className="scroll-mt-28">
          {/* Section Heading */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#14281C] sm:text-3xl">
                {pageTitle}
              </h2>

              <p className="mt-2 text-sm text-[#718176] sm:text-base">
                {isArabic
                  ? "اكتشف منتجاتنا اليومية"
                  : "Discover our everyday essentials."}
              </p>
            </div>

            {(selectedCategory || offersOnly) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#138040] transition hover:text-[#0B5A2A]"
              >
                {isArabic ? "مسح الفلاتر" : "Clear filters"}
              </button>
            )}
          </div>

          {/* Categories and Filters */}
          <ShopFilters
            selectedCategory={selectedCategory}
            offersOnly={offersOnly}
            onCategoryChange={(value) => updateParam("category", value)}
            onOffersChange={(enabled) =>
              updateParam("offers", enabled ? "1" : null)
            }
          />

          {/* Product Count */}
          <p
            className="mb-5 text-sm font-medium text-[#718176]"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic
              ? `${data?.length ?? 0} منتج`
              : `${data?.length ?? 0} ${
                  data?.length === 1 ? "product" : "products"
                }`}
          </p>

          {/* Loading */}
          {isLoading && <ProductGridSkeleton />}

          {/* Error */}
          {isError && (
            <Message
              title={t("couldNotLoad")}
              text={t("checkConnection")}
              action={{
                label: t("tryAgain"),
                onClick: () => refetch(),
              }}
            />
          )}

          {/* Empty Products */}
          {data && data.length === 0 && (
            <Message
              title={t("noProducts")}
              text={
                isArabic
                  ? "جرّب تغيير الفئة أو كلمة البحث."
                  : "Try changing the category or search term."
              }
              action={{
                label: t("clearFilters"),
                onClick: clearFilters,
              }}
            />
          )}

          {/* Product Grid */}
          {data && data.length > 0 && <ProductGrid products={data} />}
        </section>
      </div>
    </main>
  );
}
