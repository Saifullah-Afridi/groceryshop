// The database translation comes later. Until then nameAr / descriptionAr are empty and these fall back to English.
type Named = { name: string; nameAr?: string; description?: string; descriptionAr?: string };

export const localizedName = (item: Named, language: string) =>
  language === "ar" ? item.nameAr || item.name : item.name;

export const localizedDescription = (item: Named, language: string) =>
  language === "ar" ? item.descriptionAr || item.description || "" : item.description || "";

// Old names kept so existing imports keep working
export const localizedProductName = localizedName;
export const localizedCategoryName = localizedName;
