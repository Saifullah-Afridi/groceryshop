import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TableSkeleton } from "../../components/Skeleton";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import { localizedName } from "../../utils/localized";
import {
  useAdminCategories,
  useDeleteCategory,
  useSaveCategory,
} from "../../hooks/useAdmin";
import type { Category } from "../../types";
import { CATEGORY_ICONS } from "../../utils/categoryIcons";
import { PageHeader } from "../../components/admin/PageHeader";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { CategoryForm } from "../../components/admin/CategoryForm";
import { Modal } from "../../components/admin/Modal";
import { Pagination } from "../../components/admin/Pagination";

const PAGE_SIZE = 8;

export function AdminCategoriesPage() {
  const { t, language, isArabic } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: categoryResult, isLoading, isError, error } = useAdminCategories({ page: currentPage, limit: PAGE_SIZE });
  const categories = categoryResult?.data ?? [];
  const pagination = categoryResult?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  const paginatedCategories = categories;

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
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t("admin.categories.title")}
        text={t("admin.categories.text")}
        action={
          <button
            type="button"
            onClick={() => openForm("new")}
            className="
    inline-flex h-10 cursor-pointer items-center gap-2
    rounded-lg border border-brand
    bg-brand px-4
    text-sm font-semibold text-white
    shadow-sm
    transition-all duration-200 ease-in-out
    hover:-translate-y-0.5
    hover:border-brand-dark
    hover:bg-brand-dark
    hover:shadow-md
    active:translate-y-0
    active:scale-95
    active:shadow-sm
    focus:outline-none
    focus:ring-2 focus:ring-brand
    focus:ring-offset-2
  "
          >
            <Plus
              size={17}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            {t("admin.categories.add")}
          </button>
        }
      />

      {/* Category Count */}
      {!isLoading && (
        <div className="rounded-xl border border-edge bg-white px-5 py-4">
          <p className="text-sm text-muted">{t("admin.categories.title")}</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
            {pagination?.total ?? 0}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <TableSkeleton />}
      {isError && <Message title="Could not load categories" text={error instanceof Error ? error.message : "Please try again."} />}

      {/* Empty State */}
      {!isLoading && !isError && categories.length === 0 && (
        <div className="rounded-xl border border-edge bg-white p-8">
          <Message
            title={t("admin.categories.none")}
            text={t("admin.categories.noneText")}
          />

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => openForm("new")}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              <Plus size={16} />
              {t("admin.categories.add")}
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {!isLoading && !isError && categories.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-edge bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                  <th className="px-5 py-3.5 text-start">
                    {t("admin.categories.colCategory")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.categories.colImage")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.categories.colIcon")}
                  </th>

                  <th className="px-5 py-3.5 text-end">{t("actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-edge">
                {paginatedCategories.map((category) => {
                  const Icon = CATEGORY_ICONS[category.icon];
                  const categoryName = localizedName(category, language);

                  return (
                    <tr
                      key={category.id}
                      className="transition-colors duration-150 hover:bg-surface/70"
                    >
                      {/* Category Name Only */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-brand">
                          {categoryName}
                        </p>
                      </td>

                      {/* Category Image */}
                      <td className="px-5 py-4">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={t("admin.categories.imageAlt", {
                              name: categoryName,
                            })}
                            loading="lazy"
                            decoding="async"
                            className="h-11 w-11 rounded-lg border border-edge object-cover"
                          />
                        ) : (
                          <div className="grid h-11 w-11 place-items-center rounded-lg border border-dashed border-edge bg-surface text-muted">
                            <ImageIcon size={17} />
                          </div>
                        )}
                      </td>

                      {/* Category Icon */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-muted">
                          {Icon && <Icon size={19} />}
                          <span className="text-xs">{category.icon}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(category)}
                            aria-label={t("admin.editLabel", {
                              name: categoryName,
                            })}
                            title={t("admin.editLabel", {
                              name: categoryName,
                            })}
                            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition-all duration-150 hover:border-brand hover:bg-brand hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(category)}
                            aria-label={t("admin.deleteLabel", {
                              name: categoryName,
                            })}
                            title={t("admin.deleteLabel", {
                              name: categoryName,
                            })}
                            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition-all duration-150 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
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

          {/* Reusable Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination?.total ?? 0}
            pageSize={PAGE_SIZE}
            itemLabel="categories"
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      {editing && (
        <Modal
          title={
            editing === "new"
              ? t("admin.categories.add")
              : t("admin.categories.edit")
          }
          onClose={() => setEditing(null)}
        >
          <CategoryForm
            initial={editing === "new" ? undefined : editing}
            saving={save.isPending}
            error={save.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={(input, imageFile) =>
              save.mutate(
                {
                  id: editing === "new" ? undefined : editing.id,
                  input,
                  imageFile,
                },
                {
                  onSuccess: () => setEditing(null),
                },
              )
            }
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <ConfirmDialog
          title={t("admin.categories.delete")}
          text={t("admin.confirmDelete", {
            name: localizedName(deleting, language),
          })}
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
    </div>
  );
}
