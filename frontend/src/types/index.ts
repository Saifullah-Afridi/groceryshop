// These shapes will match the MongoDB models when we build the API.
// kg is priced per 0.25 kg; all other units are priced per selected selling unit.
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
  description: string;
  farm: string;
  price: number;
  unit: Unit;
  minQuantity: number;
  image: string;

  // Optional legacy fields, if existing components still use them
  oldPrice?: number | null;
  discount?: number;
  tag?: string;
}
export interface CartItem {
  productId: number;
  name: string;
  price: number;
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
