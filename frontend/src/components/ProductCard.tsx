import { useState } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Wheat,
  AlertCircle,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useCategories } from "../hooks/useShopData";
import { formatPrice, amountLabel } from "../utils/format";
import type { Product } from "../types";

const WEIGHT_OPTIONS = [0.25, 0.5, 0.75, 1];

const CATEGORY_ICONS = {
  Carrot,
  Apple,
  Beef,
  Milk,
  CupSoda,
  Wheat,
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { t, isArabic } = useLanguage();
  const { data: categories } = useCategories();

  const [selectedWeight, setSelectedWeight] = useState(0.25);

  const isWeightBased = product.unit === "kg";
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;

  // Price calculation
  const weightKey = String(selectedWeight);

  const basePrice = isWeightBased
    ? (product.unitPrices?.[weightKey] ??
      product.price * (selectedWeight / 0.25))
    : product.price;

  const discount = product.unitDiscounts?.[weightKey] ?? 0;
  const displayPrice = basePrice * (1 - discount / 100);

  // Language
  const displayName = isArabic ? product.nameAr || product.name : product.name;

  const displayDescription = isArabic
    ? product.descriptionAr || product.description
    : product.description;

  // Category image fallback
  const category = categories?.find((item) => item.id === product.categoryId);

  const Icon =
    category?.icon && category.icon in CATEGORY_ICONS
      ? CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS]
      : Package;

  // Weight controls
  const changeWeight = (amount: number) => {
    setSelectedWeight((weight) =>
      Math.max(0.25, Math.round((weight + amount) * 100) / 100),
    );
  };

  // Add to cart
  const handleAddToCart = () => {
    if (outOfStock) return;

    addItem(product, isWeightBased ? selectedWeight : 1);
  };

  return (
    <article
      dir={isArabic ? "rtl" : "ltr"}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EBE6] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
    >
      {/* ================= PRODUCT IMAGE ================= */}
      <div className="relative h-32 overflow-hidden bg-[#F7F9F6] sm:h-36 lg:h-40">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#F5F9F3] to-[#EAF3E9]">
            <span
              className="grid h-20 w-20 place-items-center rounded-full"
              style={{
                backgroundColor: category?.tint ?? "#DCEFE0",
              }}
            >
              <Icon size={48} strokeWidth={1.5} className="text-[#078A4B]" />
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#078A4B] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm sm:text-xs">
            -{discount}%
          </span>
        )}

        {/* Out of Stock Badge */}
        {outOfStock && (
          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-red-600 shadow-md sm:text-xs">
            <AlertCircle size={12} />
            {isArabic ? "نفد المخزون" : "Out of stock"}
          </span>
        )}

        {/* Low Stock Badge */}
        {!outOfStock && lowStock && (
          <span className="absolute bottom-2 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-amber-600 shadow-md sm:text-xs">
            {isArabic ? "مخزون منخفض" : "Low stock"}
          </span>
        )}
      </div>

      {/* ================= PRODUCT DETAILS ================= */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Product Name */}
        <h3 className="line-clamp-2 text-sm font-extrabold leading-[1.35] text-[#123B2A] transition-colors group-hover:text-[#078A4B] sm:text-[15px]">
          {displayName}
        </h3>

        {/* Product Description */}
        <p className="mt-1.5 line-clamp-2 min-h-[30px] text-[11px] leading-[15px] text-[#718078] sm:text-xs">
          {displayDescription ||
            (isWeightBased
              ? isArabic
                ? "السعر لكل 0.25 كغ"
                : t("pricePerQuarter")
              : `${t("pricePer")} ${product.unit}`)}
        </p>

        {/* ================= WEIGHT SELECTION ================= */}
        {isWeightBased && (
          <div className="mt-2.5">
            <p className="mb-1.5 text-[11px] font-bold text-[#183D2D] sm:text-xs">
              {t("chooseWeight")}
            </p>

            {/* Weight Options */}
            <div className="grid grid-cols-4 gap-1.5">
              {WEIGHT_OPTIONS.map((weight) => {
                const selected = selectedWeight === weight;

                return (
                  <button
                    key={weight}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedWeight(weight)}
                    className={`rounded-lg border px-1 py-1.5 text-[9px] font-bold transition-all sm:text-[10px] ${
                      selected
                        ? "border-[#078A4B] bg-[#078A4B] text-white"
                        : "border-[#DCE6DF] bg-white text-[#52675A] hover:border-[#078A4B] hover:bg-[#F0F8F2]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {amountLabel(weight, "kg")}
                  </button>
                );
              })}
            </div>

            {/* Custom Weight */}
            <div className="mt-2.5">
              <p className="mb-1.5 text-[11px] font-bold text-[#183D2D] sm:text-xs">
                {t("customWeight")}
              </p>

              <div className="flex h-9 items-center justify-between rounded-xl border border-[#DCE6DF] bg-[#FAFCFA] px-1.5">
                <button
                  type="button"
                  aria-label="Decrease weight"
                  disabled={selectedWeight <= 0.25 || outOfStock}
                  onClick={() => changeWeight(-0.25)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-[#E0EAE2] bg-white text-[#078A4B] transition hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={13} />
                </button>

                <span className="text-xs font-extrabold text-[#123B2A] sm:text-sm">
                  {amountLabel(selectedWeight, "kg")}
                </span>

                <button
                  type="button"
                  aria-label="Increase weight"
                  disabled={outOfStock}
                  onClick={() => changeWeight(0.25)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-[#E0EAE2] bg-white text-[#078A4B] transition hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PRICE & CART ================= */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E8EEE9] pt-2.5 mt-2.5">
          {/* Price */}
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-tight text-[#123B2A] sm:text-lg">
              {formatPrice(displayPrice)} JOD
            </p>

            {isWeightBased && (
              <p className="mt-0.5 text-[10px] text-[#87958D] sm:text-xs">
                {amountLabel(selectedWeight, "kg")}
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={`Add ${displayName} to cart`}
            className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl bg-[#078A4B] px-2.5 text-[10px] font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#056B3A] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#C8CBC9] disabled:text-white disabled:shadow-none disabled:hover:translate-y-0 sm:px-3 sm:text-xs"
          >
            <ShoppingCart size={14} />
            <span>{t("addToCart")}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
