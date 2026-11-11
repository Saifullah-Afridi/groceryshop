import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { inputClass } from "../../components/admin/FormField";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { ProductForm } from "../../components/admin/ProductForm";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import {
  useAdminCategories,
  useAdminProducts,
  useDeleteProduct,
  useSaveProduct,
} from "../../hooks/useAdmin";
import type { Category, Product } from "../../types";
import { CATEGORY_ICONS } from "../../utils/categoryIcons";
import { formatPrice } from "../../utils/format";
import { localizedDescription, localizedName } from "../../utils/localized";

function ProductImage({
  product,
  category,
}: {
  product: Product;
  category?: Category;
}) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-12 w-12 rounded-lg bg-surface object-cover"
      />
    );
  }

  const Icon = category ? CATEGORY_ICONS[category.icon] : Package;

  return (
    <span
      className="grid h-12 w-12 place-items-center rounded-lg text-brand"
      style={{ background: category?.tint ?? "#eee" }}
    >
      <Icon size={20} />
    </span>
  );
}

export function AdminProductsPage() {
  const { t, language, unitName, money } = useLanguage();
  const { data: categories = [] } = useAdminCategories();
  const { data: products = [], isLoading } = useAdminProducts();

  const save = useSaveProduct();
  const remove = useDeleteProduct();

  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const list = useMemo(() => {
    const text = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        (!categoryId || product.categoryId === categoryId) &&
        (!text ||
          `${product.name} ${product.nameAr ?? ""} ${product.description}`
            .toLowerCase()
            .includes(text)),
    );
  }, [products, search, categoryId]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paginatedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryOf = (id: string) =>
    categories.find((category) => category.id === id);

  const openForm = (value: Product | "new") => {
    save.reset();
    setEditing(value);
  };

  const openDelete = (value: Product) => {
    remove.reset();
    setDeleting(value);
  };

  return (
    <>
      <PageHeader
        title={t("admin.products.title")}
        text={t("admin.products.text")}
        action={
          <button
            onClick={() => openForm("new")}
            disabled={categories.length === 0}
            title={
              categories.length === 0 ? t("admin.products.createCategoryFirst") : undefined
            }
            className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
          >
            <Plus size={16} />
            {t("admin.products.add")}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-3 text-muted"
          />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder={t("admin.products.search")}
            className={`${inputClass} ps-9`}
          />
        </label>

        <select
          value={categoryId}
          onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}
          className={`${inputClass} w-auto`}
          aria-label={t("admin.products.filterCategory")}
        >
          <option value="">{t("admin.products.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {localizedName(category, language)}
            </option>
          ))}
        </select>

        <span className="self-center text-sm text-muted">
          {t("admin.products.count", { count: list.length })}
        </span>
      </div>

      {isLoading && <TableSkeleton />}

      {!isLoading && list.length === 0 && (
        <Message
          title={t("admin.products.none")}
          text={t("admin.products.noneText")}
        />
      )}

      {list.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-start text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start">{t("admin.products.colImage")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colProduct")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colDescription")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colCategory")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colPrice")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colDiscount")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colStockAlert")}</th>
                <th className="px-4 py-3 text-start">{t("admin.products.colStock")}</th>
                <th className="px-4 py-3 text-end">{t("actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-edge">
              {paginatedList.map((product) => {
                const category = categoryOf(product.categoryId);
                return (
                  <tr key={product.id} className="transition hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <ProductImage product={product} category={category} />
                    </td>

                    <td className="px-4 py-3 font-semibold">{localizedName(product, language)}</td>

                    <td className="max-w-xs px-4 py-3 text-sm text-muted">
                      <p className="line-clamp-2">
                        {localizedDescription(product, language) || t("admin.products.noDescription")}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {category ? localizedName(category, language) : t("admin.products.unknown")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {money(product.price)}
                      <span className="ms-1 text-xs font-normal text-muted">
                        / {product.unit === "kg" ? `0.25 ${unitName("kg")}` : unitName(product.unit)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {product.discount > 0 ? (
                        <span className="rounded-full bg-[#EAF6EE] px-2.5 py-1 text-xs font-extrabold text-[#078A4B]">
                          -{product.discount}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted">{t("admin.products.noDiscount")}</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {product.minQuantity > 0
                        ? `${formatPrice(product.minQuantity).replace(/\.00$/, "")} ${unitName(product.unit)}`
                        : <span className="text-xs text-muted">{t("admin.products.noStockAlert")}</span>}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={product.stockQuantity <= 0 ? "font-bold text-sale" : ""}>
                        {formatPrice(product.stockQuantity).replace(/\.00$/, "")} {unitName(product.unit)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openForm(product)}
                          aria-label={t("admin.editLabel", { name: localizedName(product, language) })}
                          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => openDelete(product)}
                          aria-label={t("admin.deleteLabel", { name: localizedName(product, language) })}
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

      {list.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            {t("admin.showing", {
              from: Math.min((page - 1) * PAGE_SIZE + 1, list.length),
              to: Math.min(page * PAGE_SIZE, list.length),
              total: list.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-edge bg-white px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">{t("admin.previous")}</button>
            <span className="min-w-16 text-center text-muted">{t("admin.pageOf", { page, pages: pageCount })}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="rounded-lg border border-edge bg-white px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">{t("admin.next")}</button>
          </div>
        </div>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? t("admin.products.add") : t("admin.products.edit")}
          onClose={() => setEditing(null)}
          size="lg"
        >
          <ProductForm
            initial={editing === "new" ? undefined : editing}
            categories={categories}
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

      {deleting && (
        <ConfirmDialog
          title={t("admin.products.delete")}
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
