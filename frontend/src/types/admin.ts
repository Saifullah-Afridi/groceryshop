import type { Category, Product } from "./index";

export type ContentLanguage = "en" | "ar";

// The form submits its text in the currently selected language. The API stores
// both language variants and preserves the untouched translation.
export type CategoryInput = Omit<Category, "id"> & {
  language: ContentLanguage;
  removeImage?: boolean;
};

export type ProductInput = Pick<
  Product,
  | "name"
  | "description"
  | "categoryId"
  | "price"
  | "unit"
  | "minQuantity"
  | "stockQuantity"
  | "discount"
  | "image"
> & {
  language: ContentLanguage;
  removeImage?: boolean;
};
