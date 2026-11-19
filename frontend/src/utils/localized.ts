// The database translation comes later.
// Arabic names fall back to English when a translation is unavailable.

type Named = {
  name: string;
  nameAr?: string | null;
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

// Keep old function names so existing imports continue working.
export const localizedProductName = localizedName;
export const localizedCategoryName = localizedName;
