// The database translation comes later.
// Until then, nameAr and descriptionAr fall back to English.

type Named = {
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
};

/**
 * Returns the name in the selected language.
 * Falls back to English if the Arabic name is empty or unavailable.
 */
export const localizedName = (item: Named, language: string): string => {
  if (language === "ar") {
    return item.nameAr?.trim() || item.name;
  }

  return item.name;
};

/**
 * Returns the description in the selected language.
 * Falls back to English if the Arabic description is empty or unavailable.
 */
export const localizedDescription = (item: Named, language: string): string => {
  if (language === "ar") {
    return item.descriptionAr?.trim() || item.description || "";
  }

  return item.description || "";
};

// Keep old function names so existing imports continue working.
export const localizedProductName = localizedName;
export const localizedCategoryName = localizedName;
