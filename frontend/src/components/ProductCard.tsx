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

import { MAX_ORDER_QUANTITY } from "../config";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useCategories } from "../hooks/useShopData";
import { clampDiscount, formatPrice, roundAmount, stepFor } from "../utils/format";
import { localizedDescription, localizedName } from "../utils/localized";
import type { Product } from "../types";

// Quick selections are always the quarter-kilo increments. Stock alerts never restrict customer quantities.
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
  const { t, isArabic, language, unitName } = useLanguage();
  const { data: categories } = useCategories();

  const isWeightBased = product.unit === "kg";

  const minimumStep = stepFor(product.unit);
  const [selectedWeight, setSelectedWeight] = useState(minimumStep);

  const outOfStock = product.stockQuantity <= 0;
  const maxAvailable = Math.min(MAX_ORDER_QUANTITY, Math.max(0, product.stockQuantity));
  const lowStock = !outOfStock && product.minQuantity > 0 && product.stockQuantity <= product.minQuantity;

  // Price calculation: one price (per 0.25 kg or per unit) and one percentage discount
  const discount = clampDiscount(product.discount);
  const grossPrice = isWeightBased
    ? product.price * (selectedWeight / 0.25)
    : product.price;
  const displayPrice = grossPrice * (1 - discount / 100);

  // Language
  const displayName = localizedName(product, language);
  const displayDescription = localizedDescription(product, language);
  const weightLabel = (weight: number) => `${String(Number(weight.toFixed(2)))} ${unitName("kg")}`;

  // Category image fallback
  const category = categories?.find((item) => item.id === product.categoryId);

  const Icon =
    category?.icon && category.icon in CATEGORY_ICONS
      ? CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS]
      : Package;

  // Weight controls
  const changeWeight = (amount: number) => {
    setSelectedWeight(() =>
      Math.min(MAX_ORDER_QUANTITY, Math.max(minimumStep, roundAmount(selectedWeight + amount))),
    );
  };

  // Add to cart
  const handleAddToCart = () => {
    if (outOfStock) return;

    addItem(product, isWeightBased ? selectedWeight : minimumStep);
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
            decoding="async"
            className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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

        {/* Top-left labels: out of stock first, then the green discount label under it */}
        {(outOfStock || discount > 0) && (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {outOfStock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-red-600 shadow-md sm:text-xs">
                <AlertCircle size={12} />
                {t("product.outOfStock")}
              </span>
            )}

            {discount > 0 && (
              <span className="rounded-full bg-[#078A4B] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm sm:text-xs">
                {t("cart.discountOff", { percent: discount })}
              </span>
            )}
          </div>
        )}

        {/* Low Stock Badge */}
        {!outOfStock && lowStock && (
          <span className="absolute bottom-2 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-amber-600 shadow-md sm:text-xs">
            {t("product.lowStock")}
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
              ? t("pricePerQuarter")
              : `${t("pricePer")} ${unitName(product.unit)}`)}
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
                    disabled={outOfStock || weight > maxAvailable}
                    onClick={() => setSelectedWeight(weight)}
                    className={`rounded-lg border px-1 py-1.5 text-[9px] font-bold transition-all sm:text-[10px] ${
                      selected
                        ? "border-[#078A4B] bg-[#078A4B] text-white"
                        : "border-[#DCE6DF] bg-white text-[#52675A] hover:border-[#078A4B] hover:bg-[#F0F8F2]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {weightLabel(weight)}
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
                  aria-label={t("product.decreaseWeight")}
                  disabled={selectedWeight <= minimumStep || outOfStock}
                  onClick={() => changeWeight(-0.25)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-[#E0EAE2] bg-white text-[#078A4B] transition hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={13} />
                </button>

                <span className="text-xs font-extrabold text-[#123B2A] sm:text-sm">
                  {weightLabel(selectedWeight)}
                </span>

                <button
                  type="button"
                  aria-label={t("product.increaseWeight")}
                  disabled={outOfStock || selectedWeight >= maxAvailable}
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
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-base font-extrabold leading-tight text-[#123B2A] sm:text-lg">
              <span>
                {formatPrice(displayPrice)} {t("currency")}
              </span>
              {discount > 0 && (
                <s className="text-[11px] font-semibold text-[#87958D] sm:text-xs">
                  {formatPrice(grossPrice)}
                </s>
              )}
            </p>

            {isWeightBased ? (
              <p className="mt-0.5 text-[10px] text-[#87958D] sm:text-xs">
                {weightLabel(selectedWeight)}
              </p>
            ) : null}
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || (isWeightBased && selectedWeight > maxAvailable)}
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
