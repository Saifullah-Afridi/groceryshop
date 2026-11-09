import type { Category, Product } from "../types";
export function localizedProductName(product: Product, language: string) {
  return language === "ar" ? product.nameAr || product.name : product.name;
}
export function localizedCategoryName(category: Category, language: string) {
  return language === "ar" ? category.nameAr || category.name : category.name;
}
