import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Category, Product } from "../../types";
import type { ProductInput } from "../../types/admin";
import { FormButtons, FormField, inputClass } from "./FormField";

interface Props {
  initial?: Product;
  categories: Category[];
  saving: boolean;
  error?: string;
  onSubmit: (input: ProductInput, imageFile: File | null) => void;
  onCancel: () => void;
}

export function ProductForm({
  initial,
  categories,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    price: initial ? String(initial.price) : "",
    unit: initial?.unit ?? "kg",
    minQuantity:
      initial?.minQuantity != null ? String(initial.minQuantity) : "",
    stockQuantity: initial?.stockQuantity != null ? String(initial.stockQuantity) : "0",
    unitPrices: initial?.unitPrices ?? {},
    unitDiscounts: initial?.unitDiscounts ?? {},
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

  const submit = (e: FormEvent) => {
    e.preventDefault();

    const price = Number(f.price);
    const minQuantity = Number(f.minQuantity);
    const found: Record<string, string> = {};

    if (!f.name.trim()) found.name = "Enter a product name";
    if (!f.description.trim()) {
      found.description = "Enter a product description";
    }
    if (!f.categoryId) found.categoryId = "Choose a category";
    if (!(price > 0)) {
      found.price = "Price must be more than 0";
    }

    if (f.minQuantity.trim() && !(minQuantity > 0)) {
      found.minQuantity = "Minimum stock quantity must be more than 0";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit(
      {
        name: f.name.trim(),
        description: f.description.trim(),
        categoryId: f.categoryId,
        price,
        unit: f.unit as Product["unit"],
        minQuantity: f.minQuantity.trim() ? minQuantity : 0,
        stockQuantity: Math.max(0, Number(f.stockQuantity) || 0),
        unitPrices: f.unitPrices,
        unitDiscounts: f.unitDiscounts,
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

      <FormField label="Product name" error={errors.name}>
        <input
          autoFocus
          value={f.name}
          onChange={set("name")}
          className={inputClass}
          placeholder="Fresh Jordan Valley Tomatoes"
        />
      </FormField>

      <FormField label="Description" error={errors.description}>
        <textarea
          value={f.description}
          onChange={set("description")}
          className={`${inputClass} min-h-24 resize-y`}
          placeholder="Describe the product..."
          rows={3}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" error={errors.categoryId}>
          <select
            value={f.categoryId}
            onChange={set("categoryId")}
            className={inputClass}
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Selling unit">
          <select value={f.unit} onChange={set("unit")} className={inputClass}>
            <option value="kg">Kilogram (kg)</option>
            <option value="item">Item / Piece</option>
            <option value="pack">Pack</option>
            <option value="dozen">Dozen (12 items)</option>
            <option value="bunch">Bunch</option>
            <option value="head">Head</option>
            <option value="bottle">Bottle</option>
          </select>
        </FormField>

        <FormField label={f.unit === "kg" ? "Price per 0.25 kg (JOD)" : `Price per ${f.unit} (JOD)`} error={errors.price}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={f.price}
            onChange={set("price")}
            className={inputClass}
            placeholder="e.g. 0.50"
          />
        </FormField>

        <FormField
          label={`Minimum stock quantity (${f.unit})`}
          error={errors.minQuantity}
        >
          <input
            type="number"
            step={f.unit === "kg" ? "0.25" : "1"}
            min="0"
            value={f.minQuantity}
            onChange={set("minQuantity")}
            className={inputClass}
            placeholder="e.g. 5"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={`Available stock (${f.unit})`}>
          <input type="number" min="0" step={f.unit === "kg" ? "0.25" : "1"} value={f.stockQuantity}
            onChange={set("stockQuantity")} className={inputClass} />
        </FormField>
        {f.unit === "kg" && (
          <div className="rounded-xl border border-line p-3 sm:col-span-2">
            <p className="mb-3 text-sm font-semibold">Weight-specific prices and discounts (JOD / %)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0.25, 0.5, 0.75, 1, 2, 3].map((weight) => {
                const key = String(weight);
                return <div key={key} className="space-y-1">
                  <label className="text-xs text-muted">{weight} kg price</label>
                  <input type="number" min="0" step="0.01" placeholder="Auto"
                    value={f.unitPrices[key] ?? ""}
                    onChange={(e) => setF(v => ({...v, unitPrices:{...v.unitPrices, [key]: Number(e.target.value)}}))}
                    className={inputClass} />
                  <label className="text-xs text-muted">Discount %</label>
                  <input type="number" min="0" max="100" step="1" placeholder="0"
                    value={f.unitDiscounts[key] ?? ""}
                    onChange={(e) => setF(v => ({...v, unitDiscounts:{...v.unitDiscounts, [key]: Number(e.target.value)}}))}
                    className={inputClass} />
                </div>;
              })}
            </div>
            <p className="mt-2 text-xs text-muted">Leave a price blank to calculate it from the base quarter-kilogram price.</p>
          </div>
        )}
      </div>

      <FormField label="Product image">
        <label
          htmlFor="product-image-upload"
          className="relative block h-36 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-brand"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Click to upload image
            </div>
          )}

          {imagePreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm font-medium text-white">
              Click to change image
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
