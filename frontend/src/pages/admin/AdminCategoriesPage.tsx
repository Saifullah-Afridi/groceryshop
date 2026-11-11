import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import { localizedName } from "../../utils/localized";
import {
  useAdminCategories,
  useAdminProducts,
  useDeleteCategory,
  useSaveCategory,
} from "../../hooks/useAdmin";
import type { Category } from "../../types";
import { CATEGORY_ICONS } from "../../utils/categoryIcons";
import { PageHeader } from "../../components/admin/PageHeader";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { CategoryForm } from "../../components/admin/CategoryForm";
import { Modal } from "../../components/admin/Modal";

export function AdminCategoriesPage() {
  const { t, language } = useLanguage();
  const { data: categories = [], isLoading } = useAdminCategories();
  const { data: products = [] } = useAdminProducts();
  const save = useSaveCategory();
  const remove = useDeleteCategory();

  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openForm = (value: Category | "new") => {
    save.reset();
    setEditing(value);
  };

  const openDelete = (value: Category) => {
    remove.reset();
    setDeleting(value);
  };

  return (
    <>
      <PageHeader
        title={t("admin.categories.title")}
        text={t("admin.categories.text")}
        action={
          <button
            onClick={() => openForm("new")}
            className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            <Plus size={16} />
            {t("admin.categories.add")}
          </button>
        }
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && categories.length === 0 && (
        <Message
          title={t("admin.categories.none")}
          text={t("admin.categories.noneText")}
        />
      )}

      {categories.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-start text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start">{t("admin.categories.colCategory")}</th>
                <th className="px-4 py-3 text-start">{t("admin.categories.colImage")}</th>
                <th className="px-4 py-3 text-start">{t("admin.categories.colIcon")}</th>
                <th className="px-4 py-3 text-start">{t("admin.categories.colProducts")}</th>
                <th className="px-4 py-3 text-end">{t("actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-edge">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.icon];

                const productCount = products.filter(
                  (product) => product.categoryId === category.id,
                ).length;

                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3 font-semibold">{localizedName(category, language)}</td>

                    <td className="px-4 py-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={t("admin.categories.imageAlt", { name: localizedName(category, language) })}
                          loading="lazy"
                          decoding="async"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted">{t("admin.categories.noImage")}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-brand">
                        <Icon size={20} />
                      </div>
                    </td>

                    <td className="px-4 py-3">{productCount}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openForm(category)}
                          aria-label={t("admin.editLabel", { name: localizedName(category, language) })}
                          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => openDelete(category)}
                          aria-label={t("admin.deleteLabel", { name: localizedName(category, language) })}
                          className="grid h-9 w-9 place-items-center rounded-lg text-sale hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? t("admin.categories.add") : t("admin.categories.edit")}
          onClose={() => setEditing(null)}
        >
          <CategoryForm
            initial={editing === "new" ? undefined : editing}
            saving={save.isPending}
            error={save.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={(input, imageFile, removeImage) =>
              save.mutate(
                {
                  id: editing === "new" ? undefined : editing.id,
                  input,
                  imageFile,
                  removeImage,
                },
                {
                  onSuccess: () => setEditing(null),
                },
              )
            }
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={t("admin.categories.delete")}
          text={t("admin.confirmDelete", { name: localizedName(deleting, language) })}
          confirmLabel={t("delete")}
          busy={remove.isPending}
          error={remove.error?.message}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            remove.mutate(deleting.id, {
              onSuccess: () => setDeleting(null),
            })
          }
        />
      )}
    </>
  );
}
