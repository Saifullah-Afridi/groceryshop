import { ArrowDownUp } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  total: number;
  sort: string;
  onSortChange: (value: string) => void;
}

export function ShopToolbar({ total, sort, onSortChange }: Props) {
  const { isArabic } = useLanguage();

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="mb-5 flex flex-wrap items-center justify-between gap-3"
    >
      {/* Product Count */}
      <p className="text-sm font-medium text-[#718176]">
        {isArabic
          ? `${total} منتج`
          : `${total} ${total === 1 ? "product" : "products"}`}
      </p>

      {/* Sorting */}
      <label className="flex items-center gap-2 rounded-xl border border-[#DCE9E0] bg-white px-3 py-2.5 transition hover:border-[#138040]">
        <ArrowDownUp size={16} className="shrink-0 text-[#718176]" />

        <span className="sr-only">
          {isArabic ? "ترتيب المنتجات" : "Sort products"}
        </span>

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="max-w-[220px] cursor-pointer bg-transparent text-sm font-semibold text-[#14281C] outline-none"
        >
          <option value="price-asc">
            {isArabic ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
          </option>

          <option value="price-desc">
            {isArabic ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
          </option>
        </select>
      </label>
    </div>
  );
}
