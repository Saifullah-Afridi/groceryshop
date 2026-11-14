import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { localizedDescription, localizedName } from "../../utils/localized";
import type { Category, IconKey } from "../../types";
import type { CategoryInput } from "../../types/admin";
import { CATEGORY_ICONS, ICON_KEYS } from "../../utils/categoryIcons";
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
  const [name, setName] = useState(initial ? localizedName(initial, language) : "");
  const [icon, setIcon] = useState<IconKey>(initial?.icon ?? "Carrot");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image ?? "");
  const [nameError, setNameError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setName(initial ? localizedName(initial, language) : "");
    setIcon(initial?.icon ?? "Carrot");
    setImageFile(null);
    setRemoveImage(false);
    setNameError("");
  }, [initial?.id, language]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(removeImage ? "" : initial?.image ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, initial?.image, removeImage]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setRemoveImage(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      setImageFile(file);
      setRemoveImage(false);
    }
  };

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
        image: removeImage ? "" : initial?.image ?? "",
        removeImage,
      },
      imageFile,
    );
  };

  const SelectedIcon = CATEGORY_ICONS[icon];

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-sale">
          {error}
        </p>
      )}

      <FormField label={t("admin.cf.name")} error={nameError}>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          placeholder={t("admin.cf.namePlaceholder")}
        />
      </FormField>

      <FormField label={t("admin.cf.icon")}>
        <select
          value={icon}
          onChange={(event) => setIcon(event.target.value as IconKey)}
          className={inputClass}
        >
          {ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <SelectedIcon size={20} />
          <span>{t("admin.cf.selectedIcon", { icon })}</span>
        </div>
      </FormField>

      <FormField label={t("admin.cf.image")}>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="group relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-edge bg-surface transition hover:border-brand"
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
              <span className="absolute inset-0 grid place-items-center bg-black/30 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                {t("admin.cf.change")}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <SelectedIcon size={32} />
              <span className="text-sm font-medium">
                {t("admin.cf.uploadOrDrag")}
              </span>
              <span className="text-xs text-muted">{t("admin.cf.formats")}</span>
            </div>
          )}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setPreviewUrl("");
              setRemoveImage(true);
            }}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <X size={16} />
            {t("admin.cf.removeImage")}
          </button>
        )}
      </FormField>

      <FormButtons saving={saving} onCancel={onCancel} />
    </form>
  );
}
