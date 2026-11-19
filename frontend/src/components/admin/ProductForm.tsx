import { prepareImageUpload } from "../../utils/imageUpload";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import { ImagePlus, Trash2 } from "lucide-react";

import {
  useLanguage,
  type TranslationKey,
} from "../../context/LanguageContext";
import type { Category, Product, Unit } from "../../types";
import type { ProductInput } from "../../types/admin";

import { MAX_ORDER_QUANTITY } from "../../config";
import { clampDiscount, formatPrice, stepFor } from "../../utils/format";
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

const UNITS: Unit[] = ["kg", "item", "pack", "dozen", "bunch", "bottle"];

export function ProductForm({
  initial,
  categories,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t, language, unitName } = useLanguage();

  const getInitialValues = () => ({
    name: initial ? localizedName(initial, language) : "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    price: initial ? String(initial.price) : "",
    discount: initial?.discount ? String(initial.discount) : "",
    unit: (initial?.unit ?? "kg") as Unit,
    minQuantity: initial?.minQuantity ? String(initial.minQuantity) : "",
    stockQuantity:
      initial?.stockQuantity != null ? String(initial.stockQuantity) : "0",
    image: initial?.image ?? "",
  });

  const [f, setF] = useState(getInitialValues);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removeImage, setRemoveImage] = useState(false);

  // Synchronize the form whenever the selected product changes.
  useEffect(() => {
    setF(getInitialValues());
    setImageFile(null);
    setRemoveImage(false);
    setErrors({});
    setPreviewUrl(initial?.image ?? "");
  }, [
    initial?.id,
    initial?.name,
    initial?.nameAr,
    initial?.categoryId,
    initial?.price,
    initial?.discount,
    initial?.unit,
    initial?.minQuantity,
    initial?.stockQuantity,
    initial?.image,
    language,
    categories,
  ]);

  // Image preview.
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(removeImage ? "" : (initial?.image ?? ""));
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, initial?.image, removeImage]);

  // Update form fields.
  const set =
    (key: keyof typeof f) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setF((current) => ({
        ...current,
        [key]: event.target.value,
      }));

      setErrors((current) => ({
        ...current,
        [key]: "",
      }));
    };

  // Select image.
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    try {
      const prepared = await prepareImageUpload(file);
      setImageFile(prepared);
      setRemoveImage(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not process this image.");
    }
  };

  // Drag and drop image.
  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const prepared = await prepareImageUpload(file);
      setImageFile(prepared);
      setRemoveImage(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not process this image.");
    }
  };

  // Remove image.
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setF((current) => ({
      ...current,
      image: "",
    }));
    setRemoveImage(true);
  };

  const isKg = f.unit === "kg";
  const step = stepFor(f.unit);
  const unitLabel = unitName(f.unit);

  // Discount preview.
  const priceNumber = Number(f.price);
  const discountNumber = clampDiscount(Number(f.discount));
  const showPreview = priceNumber > 0 && discountNumber > 0;

  // Submit form.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(f.price);
    const discount = f.discount.trim() ? Number(f.discount) : 0;
    const minQuantity = f.minQuantity.trim() ? Number(f.minQuantity) : 0;
    const stockQuantity = f.stockQuantity.trim() ? Number(f.stockQuantity) : 0;

    const found: Record<string, string> = {};

    if (!f.name.trim()) {
      found.name = t("admin.pf.errName");
    }


    if (!f.categoryId) {
      found.categoryId = t("admin.pf.errCategory");
    }

    if (!(price > 0) || !Number.isFinite(price)) {
      found.price = t("admin.pf.errPrice");
    }

    if (!Number.isFinite(discount) || !(discount >= 0 && discount <= 100)) {
      found.discount = t("admin.pf.errDiscount");
    }

    // Inventory warning threshold validation.
    const thresholdSteps = minQuantity / step;

    if (
      !(minQuantity >= 0) ||
      !Number.isFinite(minQuantity) ||
      (minQuantity > 0 &&
        Math.abs(thresholdSteps - Math.round(thresholdSteps)) > 1e-9)
    ) {
      found.minQuantity = isKg
        ? t("admin.pf.errStockThresholdKg")
        : t("admin.pf.errStockThresholdUnit");
    }

    if (minQuantity > MAX_ORDER_QUANTITY) {
      found.minQuantity = t("admin.pf.errStockThresholdMax", {
        max: MAX_ORDER_QUANTITY,
      });
    }

    if (!(stockQuantity >= 0) || !Number.isFinite(stockQuantity)) {
      found.stockQuantity = t("admin.pf.errStock");
    }

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    onSubmit(
      {
        name: f.name.trim(),
        language,
        categoryId: f.categoryId,
        price,
        discount,
        unit: f.unit,
        minQuantity,
        stockQuantity,
        image: removeImage ? "" : f.image.trim(),
        removeImage,
      },
      imageFile,
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Server Error */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-sale">
          {error}
        </p>
      )}

      {/* Product Name */}
      <FormField label={t("admin.pf.name")} error={errors.name}>
        <input
          autoFocus
          type="text"
          name="productName"
          value={f.name}
          onChange={set("name")}
          placeholder={initial ? "" : t("admin.pf.namePlaceholder")}
          className={inputClass}
        />
      </FormField>

      {/* Category and Unit */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("admin.pf.category")} error={errors.categoryId}>
          <select
            value={f.categoryId}
            onChange={set("categoryId")}
            className={`
              ${inputClass}
              cursor-pointer
              transition-colors duration-200
              hover:border-brand
            `}
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
          <select
            value={f.unit}
            onChange={set("unit")}
            className={`
              ${inputClass}
              cursor-pointer
              transition-colors duration-200
              hover:border-brand
            `}
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`unit.option.${unit}` as TranslationKey)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Price and Discount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={
            isKg
              ? t("admin.pf.priceQuarter")
              : t("admin.pf.priceUnit", { unit: unitLabel })
          }
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

      {/* Discount Preview */}
      {showPreview && (
        <div className="rounded-xl border border-[#cce8d5] bg-[#EAF6EE] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#078A4B]">
            {t("admin.pf.discount")}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#078A4B]">
            {t("admin.pf.preview", {
              final: formatPrice(priceNumber * (1 - discountNumber / 100)),
              old: formatPrice(priceNumber),
              per: isKg
                ? t("admin.pf.previewQuarter")
                : t("admin.pf.previewUnit", { unit: unitLabel }),
            })}
          </p>
        </div>
      )}

      {/* Stock Settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t("admin.pf.stockAlert", { unit: unitLabel })}
          error={errors.minQuantity}
          hint={t("admin.pf.stockAlertHint", { unit: unitLabel })}
        >
          <input
            type="number"
            step={step}
            min="0"
            max={MAX_ORDER_QUANTITY}
            value={f.minQuantity}
            onChange={set("minQuantity")}
            className={inputClass}
            placeholder="0"
          />
        </FormField>

        <FormField
          label={t("admin.pf.stock", { unit: unitLabel })}
          error={errors.stockQuantity}
        >
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

      {/* Product Image */}
      <FormField label={t("admin.pf.image")}>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="
            group relative flex min-h-44 cursor-pointer
            flex-col items-center justify-center overflow-hidden
            rounded-xl border-2 border-dashed border-edge
            bg-surface transition-colors duration-200
            hover:border-brand hover:bg-brand/5
          "
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="sr-only"
          />

          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={f.name || t("admin.pf.preview.alt")}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <span
                className="
                  absolute inset-0 grid place-items-center
                  bg-black/35 text-sm font-semibold text-white
                  opacity-0 transition-opacity duration-200
                  group-hover:opacity-100
                "
              >
                {t("admin.pf.change")}
              </span>

              {/* Remove Image */}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleRemoveImage();
                }}
                aria-label={t("admin.pf.removeImage")}
                title={t("admin.pf.removeImage")}
                className="
                  absolute right-3 top-3 z-10
                  grid h-9 w-9 cursor-pointer place-items-center
                  rounded-lg border border-white/30
                  bg-red-600 text-white shadow-md
                  transition-all duration-200
                  hover:scale-105 hover:bg-red-700
                  active:scale-95
                  focus:outline-none focus:ring-2
                  focus:ring-red-400 focus:ring-offset-2
                "
              >
                <Trash2 size={17} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 py-7 text-center">
              <div
                className="
                  grid h-12 w-12 place-items-center
                  rounded-xl border border-edge
                  bg-white text-brand
                  transition-colors group-hover:border-brand
                "
              >
                <ImagePlus size={23} />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-brand">
                  {t("admin.pf.upload")}
                </p>

                <p className="text-xs text-muted">JPEG, PNG, WEBP or GIF</p>
              </div>
            </div>
          )}
        </label>
      </FormField>

      {/* Form Actions */}
      <div className="border-t border-edge pt-4">
        <FormButtons saving={saving} onCancel={onCancel} />
      </div>
    </form>
  );
}
