// These shapes match the API. kg is priced per 0.25 kg; every other unit is priced per selling unit.
// A product has ONE price and ONE percentage discount that applies to the whole price.
export type Unit = "kg" | "item" | "pack" | "dozen" | "bunch" | "head" | "bottle";
export type IconKey =
  | "Carrot"
  | "Apple"
  | "Beef"
  | "Milk"
  | "CupSoda"
  | "Wheat";
export type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  icon: IconKey;
  tint: string;
  color: string;
  image?: string;
}
export interface Product {
  id: number;
  categoryId: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  farm: string;
  price: number; // JOD per 0.25 kg (kg products) or per selling unit
  discount: number; // percent, 0 to 100. One discount for the whole price.
  unit: Unit;
  minQuantity: number; // inventory low-stock alert threshold; 0 disables the alert.
  stockQuantity: number;
  isOutOfStock?: boolean;
  image: string;
}
export interface CartItem {
  productId: number;
  name: string;
  nameAr?: string;
  price: number; // before discount
  discount: number; // percent
  minQuantity: number; // minimum step for this cart line (0.25 kg / 1 unit); not admin stock threshold
  unit: Unit;
  amount: number;
  image: string;
}
export interface ProductQuery {
  category?: string;
  q?: string;
  sort?: SortKey;
  offersOnly?: boolean;
  price?: "lt1" | "1to5" | "gt5";
  minRating?: number;
}
