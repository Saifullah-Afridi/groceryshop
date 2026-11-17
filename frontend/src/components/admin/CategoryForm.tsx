import { prepareImageUpload } from "../../utils/imageUpload";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import { Trash2, ImagePlus } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { localizedDescription, localizedName } from "../../utils/localized";

import type { Category, IconKey } from "../../types";
import type { CategoryInput } from "../../types/admin";

import { ICON_KEYS } from "../../utils/categoryIcons";
import { FormButtons, FormField, inputClass } from "./FormField";

interface Props {
  initial?: Category;
  saving: boolean;
  error?: string;
  onSubmit: (input: CategoryInput, imageFile: File | null) => void;
  onCancel: () => void;
}

export function CategoryForm({
  initial,
  saving,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t, language } = useLanguage();

  const getInitialName = () =>
    initial ? localizedName(initial, language) : "";

  const [name, setName] = useState(getInitialName);
  const [icon, setIcon] = useState<IconKey>(initial?.icon ?? "Carrot");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image ?? "");
  const [nameError, setNameError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  /*
   * Synchronize form whenever the selected category's
   * actual data changes.
   */
  useEffect(() => {
    setName(getInitialName());
    setIcon(initial?.icon ?? "Carrot");
    setImageFile(null);
    setRemoveImage(false);
    setNameError("");
  }, [
    initial?.id,
    initial?.name,
    initial?.nameAr,
    initial?.icon,
    initial?.image,
    language,
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
    setRemoveImage(true);
  };

  // Submit form.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError(t("admin.cf.errName"));
      return;
    }

    setNameError("");

    onSubmit(
      {
        name: trimmedName,
        description: initial ? localizedDescription(initial, language) : "",
        language,
        icon,
        color: initial?.color ?? "#0a4a2a",
        tint: initial?.tint ?? "#d9ecd9",
        image: removeImage ? "" : (initial?.image ?? ""),
        removeImage,
      },
      imageFile,
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Error */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-sale">
          {error}
        </p>
      )}

      {/* Category Name */}
      <FormField label={t("admin.cf.name")} error={nameError}>
        <input
          autoFocus
          type="text"
          name="categoryName"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
          }}
          placeholder={initial ? "" : t("admin.cf.namePlaceholder")}
          className={inputClass}
        />
      </FormField>

      {/* Category Icon */}
      <FormField label={t("admin.cf.icon")}>
        <select
          value={icon}
          onChange={(event) => setIcon(event.target.value as IconKey)}
          className={`
            ${inputClass}
            cursor-pointer
            transition-colors duration-200
            hover:border-brand
          `}
        >
          {ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </FormField>

      {/* Category Image */}
      <FormField label={t("admin.cf.image")}>
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
                alt={name || t("admin.cf.previewAlt")}
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
                {t("admin.cf.change")}
              </span>

              {/* Remove Image */}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleRemoveImage();
                }}
                aria-label={t("admin.cf.removeImage")}
                title={t("admin.cf.removeImage")}
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
                  {t("admin.cf.uploadOrDrag")}
                </p>

                <p className="text-xs text-muted">{t("admin.cf.formats")}</p>
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
