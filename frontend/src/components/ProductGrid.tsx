import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./Skeleton";
import type { Product } from "../types";

export const gridClass =
  "grid grid-cols-2 gap-4 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className={gridClass} role="status" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
