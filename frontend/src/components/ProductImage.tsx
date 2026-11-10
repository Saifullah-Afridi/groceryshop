import {
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Package,
  Wheat,
} from "lucide-react";

import { useCategories } from "../hooks/useShopData";
import type { Product } from "../types";

const ICONS = {
  Carrot,
  Apple,
  Beef,
  Milk,
  CupSoda,
  Wheat,
};

export function ProductImage({
  product,
  size = "md",
}: {
  product: Product;
  size?: "md" | "lg";
}) {
  const { data: categories } = useCategories();

  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  const category = categories?.find((c) => c.id === product.categoryId);

  const Icon = category ? ICONS[category.icon as keyof typeof ICONS] : Package;

  const iconSize = size === "lg" ? 72 : 52;

  return (
    <div className="grid h-full w-full place-items-center bg-[#F0F7F1]">
      <span
        className={`grid place-items-center rounded-full text-[#138040] ${
          size === "lg" ? "h-36 w-36" : "h-24 w-24"
        }`}
        style={{
          backgroundColor: category?.tint ?? "#DCEFE0",
        }}
      >
        <Icon size={iconSize} strokeWidth={1.4} />
      </span>
    </div>
  );
}
