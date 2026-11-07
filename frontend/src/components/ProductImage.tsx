import { Apple, Beef, Carrot, CupSoda, Milk, Package, Wheat } from "lucide-react";
import { useCategories } from "../hooks/useShopData";
import type { Product } from "../types";

const ICONS = { Carrot, Apple, Beef, Milk, CupSoda, Wheat };

// Shows the real photo when product.image is set, otherwise a tidy placeholder in the category colors.
export function ProductImage({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const { data: categories } = useCategories();
  if (product.image) return <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain" />;

  const category = categories?.find((c) => c.id === product.categoryId);
  const Icon = category ? ICONS[category.icon] : Package;
  const box = size === "lg" ? "h-44 w-44" : "h-24 w-24";
  return (
    <span className={`grid place-items-center rounded-full text-brand ${box}`} style={{ background: category?.tint ?? "#eef2ee" }}>
      <Icon size={size === "lg" ? 72 : 42} strokeWidth={1.5} />
    </span>
  );
}
