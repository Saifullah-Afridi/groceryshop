import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Container } from "../components/Container";
import { FilterBar } from "../components/FilterBar";
import { Message } from "../components/Message";
import { ProductGrid, ProductGridSkeleton } from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useShopData";
import { useLanguage } from "../context/LanguageContext";
import type { ProductQuery, SortKey } from "../types";

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const { t, isArabic } = useLanguage();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [params.get("category")]);
  const query: ProductQuery = {
    category: params.get("category") ?? undefined,
    q: params.get("q") ?? undefined,
    sort: (params.get("sort") ?? "featured") as SortKey,
    offersOnly: params.get("offers") === "1",
    price: (params.get("price") ?? undefined) as ProductQuery["price"],
    minRating: params.get("rating") ? Number(params.get("rating")) : undefined,
  };
  const { data, isLoading, isError, refetch } = useProducts(query);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const title = query.q
    ? `Results for "${query.q}"`
    : (categories.find((c) => c.id === query.category)?.name ?? t("allProducts"));

  return (
    <>
      <Container className="mt-10">
        <h2
          id="products"
          className="mb-4 scroll-mt-32 text-2xl  text-brand  font-bold"
        >
          {title}
        </h2>
        <FilterBar
          params={params}
          onChange={update}
          total={data?.length ?? 0}
        />
        {isLoading && <ProductGridSkeleton />}
        {isError && (
          <Message
            title={t("couldNotLoad")}
            text={t("checkConnection")}
            action={{ label: t("tryAgain"), onClick: () => refetch() }}
          />
        )}
        {data && data.length === 0 && (
          <Message
            title={t("noProducts")}
            text={isArabic ? "أزل أحد عوامل التصفية أو جرّب كلمة بحث أقصر." : "Clear a filter or try a shorter search word."}
            action={{ label: t("clearFilters"), onClick: () => setParams({}) }}
          />
        )}
        {data && data.length > 0 && <ProductGrid products={data} />}
      </Container>
    </>
  );
}
