import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./Skeleton";
import type { Product } from "../types";

export const gridClass =
  "grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4";

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
