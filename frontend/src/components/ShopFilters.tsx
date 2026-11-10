import { useState } from "react";

import {
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Wheat,
  Tag,
  ListFilter,
  ChevronDown,
  Check,
} from "lucide-react";

import { useCategories } from "../hooks/useShopData";
import { useLanguage } from "../context/LanguageContext";

import type { Category, IconKey } from "../types";

const ICONS = {
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Wheat,
};

interface Props {
  selectedCategory: string | null;
  offersOnly: boolean;
  onCategoryChange: (category: string | null) => void;
  onOffersChange: (enabled: boolean) => void;
}

export function ShopFilters({
  selectedCategory,
  offersOnly,
  onCategoryChange,
  onOffersChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { isArabic } = useLanguage();

  const categoryName = (category: Category) =>
    isArabic ? category.nameAr || category.name : category.name;

  const renderCategory = (category: Category) => {
    const Icon = ICONS[category.icon as IconKey] || Carrot;
    const active = selectedCategory === category.id;

    return (
      <button
        key={category.id}
        type="button"
        onClick={() => onCategoryChange(active ? null : category.id)}
        aria-pressed={active}
        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
          active
            ? "border-[#138040] bg-[#138040] text-white shadow-sm"
            : "border-[#DCE9E0] bg-white text-[#14281C] hover:border-[#138040] hover:bg-[#EAF6EE]"
        }`}
      >
        <Icon size={17} />
        <span>{categoryName(category)}</span>
      </button>
    );
  };

  return (
    <div
      className="mb-6 flex items-center gap-3"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Category Pills */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Products */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          aria-pressed={!selectedCategory}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            !selectedCategory
              ? "border-[#138040] bg-[#138040] text-white shadow-sm"
              : "border-[#DCE9E0] bg-white text-[#14281C] hover:border-[#138040] hover:bg-[#EAF6EE]"
          }`}
        >
          <ListFilter size={17} />
          {isArabic ? "الكل" : "All"}
        </button>

        {/* Dynamic Categories */}
        {categories.map(renderCategory)}
      </div>

      {/* Filters Dropdown */}
      <div className="relative shrink-0 pb-2">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            offersOnly
              ? "border-[#138040] bg-[#138040] text-white shadow-sm"
              : "border-[#138040] bg-white text-[#138040] hover:bg-[#EAF6EE]"
          }`}
        >
          <ListFilter size={17} />

          <span>{isArabic ? "الفلاتر" : "Filters"}</span>

          {offersOnly && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#138040]">
              1
            </span>
          )}

          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div
            className={`absolute top-full z-30 mt-1 w-64 rounded-2xl border border-[#DCE9E0] bg-white p-3 shadow-xl ${
              isArabic ? "right-0" : "left-0"
            }`}
          >
            {/* Dropdown Heading */}
            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#718176]">
              {isArabic ? "تصفية المنتجات" : "Filter Products"}
            </p>

            {/* Offers Only */}
            <button
              type="button"
              onClick={() => {
                onOffersChange(!offersOnly);
                setIsOpen(false);
              }}
              aria-pressed={offersOnly}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                offersOnly
                  ? "bg-[#EAF6EE] text-[#138040]"
                  : "text-[#14281C] hover:bg-[#F5FAF7]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Tag size={17} />

                {isArabic ? "العروض فقط" : "Offers Only"}
              </span>

              {offersOnly && <Check size={17} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
