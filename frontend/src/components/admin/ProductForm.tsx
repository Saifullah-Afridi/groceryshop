import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useLanguage, type TranslationKey } from "../../context/LanguageContext";
import type { Category, Product, Unit } from "../../types";
import type { ProductInput } from "../../types/admin";
import { MAX_ORDER_QUANTITY } from "../../config";
import { QUARTER, clampDiscount, formatPrice, stepFor } from "../../utils/format";
import { localizedName } from "../../utils/localized";
import { FormButtons, FormField, inputClass } from "./FormField";

interface Props {
  initial?: Product;
  categories: Category[];
  saving: boolean;
  error?: string;
  onSubmit: (input: ProductInput, imageFile: File | null) => void;
  onCancel: () => void;
}

const UNITS: Unit[] = ["kg", "item", "pack", "dozen", "bunch", "head", "bottle"];

// A number typed in the form is a multiple of the step (0.25 for kg, 1 for the rest)
const isMultipleOf = (value: number, step: number) => Math.abs(value / step - Math.round(value / step)) < 1e-9;

export function ProductForm({
  initial,
  categories,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t, language, unitName } = useLanguage();
  const [f, setF] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    price: initial ? String(initial.price) : "",
    discount: initial?.discount ? String(initial.discount) : "",
    unit: (initial?.unit ?? "kg") as Unit,
    minQuantity: initial?.minQuantity ? String(initial.minQuantity) : "",
    stockQuantity: initial?.stockQuantity != null ? String(initial.stockQuantity) : "0",
    image: initial?.image ?? "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!imageFile) return;

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const set =
    (key: keyof typeof f) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setF((current) => ({ ...current, [key]: e.target.value }));
    };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (!file) {
      setImagePreview(f.image);
    }
  };

  const isKg = f.unit === "kg";
  const step = stepFor(f.unit);
  const unitLabel = unitName(f.unit);

  // A live preview of what the shopper will pay, so the discount is easy to check
  const priceNumber = Number(f.price);
  const discountNumber = clampDiscount(Number(f.discount));
  const showPreview = priceNumber > 0 && discountNumber > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();

    const price = Number(f.price);
    const discount = f.discount.trim() ? Number(f.discount) : 0;
    const minQuantity = f.minQuantity.trim() ? Number(f.minQuantity) : 0;
    const stockQuantity = f.stockQuantity.trim() ? Number(f.stockQuantity) : 0;
    const found: Record<string, string> = {};

    if (!f.name.trim()) found.name = t("admin.pf.errName");
    if (!f.description.trim()) found.description = t("admin.pf.errDescription");
    if (!f.categoryId) found.categoryId = t("admin.pf.errCategory");
    if (!(price > 0)) found.price = t("admin.pf.errPrice");
    if (!(discount >= 0 && discount <= 100)) found.discount = t("admin.pf.errDiscount");

    // The minimum order goes up in the same steps the shopper buys in: 0.25 kg, or whole pieces.
    if (f.minQuantity.trim() && !(minQuantity > 0 && isMultipleOf(minQuantity, step))) {
      found.minQuantity = isKg ? t("admin.pf.errMinKg") : t("admin.pf.errMinUnit");
    }
    if (minQuantity > MAX_ORDER_QUANTITY) found.minQuantity = t("admin.pf.errMinMax", { max: MAX_ORDER_QUANTITY });
    if (!(stockQuantity >= 0)) found.stockQuantity = t("admin.pf.errStock");

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit(
      {
        name: f.name.trim(),
        description: f.description.trim(),
        categoryId: f.categoryId,
        price,
        discount,
        unit: f.unit,
        minQuantity,
        stockQuantity,
        image: f.image.trim(),
      },
      imageFile,
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">
          {error}
        </p>
      )}

      <FormField label={t("admin.pf.name")} error={errors.name}>
        <input
          autoFocus
          value={f.name}
          onChange={set("name")}
          className={inputClass}
          placeholder={t("admin.pf.namePlaceholder")}
        />
      </FormField>

      <FormField label={t("admin.pf.description")} error={errors.description}>
        <textarea
          value={f.description}
          onChange={set("description")}
          className={`${inputClass} min-h-24 resize-y`}
          placeholder={t("admin.pf.descPlaceholder")}
          rows={3}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("admin.pf.category")} error={errors.categoryId}>
          <select
            value={f.categoryId}
            onChange={set("categoryId")}
            className={inputClass}
          >
            <option value="">{t("admin.pf.chooseCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localizedName(category, language)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t("admin.pf.unit")}>
          <select value={f.unit} onChange={set("unit")} className={inputClass}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`unit.option.${unit}` as TranslationKey)}
              </option>
            ))}
          </select>
        </FormField>

        {/* ONE price. For kg it is the price of a quarter kilo; every other weight is worked out from it. */}
        <FormField
          label={isKg ? t("admin.pf.priceQuarter") : t("admin.pf.priceUnit", { unit: unitLabel })}
          error={errors.price}
        >
          <input
            type="number"
            step="0.01"
            min="0"
            value={f.price}
            onChange={set("price")}
            className={inputClass}
            placeholder={t("admin.pf.pricePlaceholder")}
          />
        </FormField>

        {/* ONE discount, in percent, taken off the whole price */}
        <FormField
          label={t("admin.pf.discount")}
          error={errors.discount}
          hint={t("admin.pf.discountHint")}
        >
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            value={f.discount}
            onChange={set("discount")}
            className={inputClass}
            placeholder="0"
          />
        </FormField>
      </div>

      {showPreview && (
        <p className="rounded-lg bg-[#EAF6EE] px-3 py-2 text-sm font-semibold text-[#078A4B]">
          {t("admin.pf.preview", {
            final: formatPrice(priceNumber * (1 - discountNumber / 100)),
            old: formatPrice(priceNumber),
            per: isKg ? t("admin.pf.previewQuarter") : t("admin.pf.previewUnit", { unit: unitLabel }),
          })}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* The least a shopper can order. In steps of 0.25 kg, so 2.25 kg is fine and 2.1 kg is not. */}
        <FormField
          label={t("admin.pf.minOrder", { unit: unitLabel })}
          error={errors.minQuantity}
          hint={isKg ? t("admin.pf.minHintKg") : t("admin.pf.minHintUnit")}
        >
          <input
            type="number"
            step={step}
            min="0"
            max={MAX_ORDER_QUANTITY}
            value={f.minQuantity}
            onChange={set("minQuantity")}
            className={inputClass}
            placeholder={isKg ? String(QUARTER) : "1"}
          />
        </FormField>

        <FormField label={t("admin.pf.stock", { unit: unitLabel })} error={errors.stockQuantity}>
          <input
            type="number"
            min="0"
            step={step}
            value={f.stockQuantity}
            onChange={set("stockQuantity")}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label={t("admin.pf.image")}>
        <label
          htmlFor="product-image-upload"
          className="relative block h-36 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-edge bg-surface hover:border-brand"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={t("admin.pf.preview.alt")}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              {t("admin.pf.upload")}
            </div>
          )}

          {imagePreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm font-medium text-white">
              {t("admin.pf.change")}
            </div>
          )}

          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </FormField>

      <FormButtons saving={saving} onCancel={onCancel} />
    </form>
  );
}
