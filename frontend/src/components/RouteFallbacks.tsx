import { useLanguage } from "../context/LanguageContext";
import { Container } from "./Container";
import { ProductGridSkeleton } from "./ProductGrid";
import { Skeleton, TableSkeleton } from "./Skeleton";

// Shown only while a page's code is downloading. It looks like the page that is about to appear,
// so nothing jumps. There is no full-screen spinner anywhere in the app.

export function StorefrontFallback() {
  const { t } = useLanguage();
  return (
    <div role="status" aria-busy="true" aria-label={t("pageLoading")} className="min-h-[70vh]">
      <div className="h-[340px] w-full bg-[#031D1A] sm:h-[400px]" aria-hidden="true" />
      <Container className="py-10">
        <Skeleton className="mb-3 h-8 w-64 bg-[#E8F1E9]" />
        <Skeleton className="mb-8 h-4 w-80 max-w-full bg-[#E8F1E9]" />
        <ProductGridSkeleton />
      </Container>
    </div>
  );
}

export function AdminFallback() {
  const { t } = useLanguage();
  return (
    <div role="status" aria-busy="true" aria-label={t("pageLoading")}>
      <Skeleton className="mb-2 h-8 w-56 bg-[#DCEAE1]" />
      <Skeleton className="mb-6 h-4 w-80 max-w-full bg-[#DCEAE1]" />
      <TableSkeleton />
    </div>
  );
}

// The very first paint of /admin, before the admin layout itself has arrived.
export function BlankFallback() {
  return <div className="min-h-screen bg-[#F5FAF7]" role="status" aria-busy="true" />;
}
