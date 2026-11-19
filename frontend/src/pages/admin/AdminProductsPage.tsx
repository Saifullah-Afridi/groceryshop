import {
  Image as ImageIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { TableSkeleton } from "../../components/Skeleton";
import { Message } from "../../components/Message";

import { useLanguage } from "../../context/LanguageContext";

import {
  useAdminCategories,
  useAdminProducts,
  useDeleteProduct,
  useRestoreProduct,
  useSaveProduct,
} from "../../hooks/useAdmin";

import type { Category, Product } from "../../types";

import { CATEGORY_ICONS } from "../../utils/categoryIcons";
import { formatPrice } from "../../utils/format";
import { localizedName } from "../../utils/localized";

import { PageHeader } from "../../components/admin/PageHeader";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ProductForm } from "../../components/admin/ProductForm";
import { Modal } from "../../components/admin/Modal";
import { Pagination } from "../../components/admin/Pagination";
import { inputClass } from "../../components/admin/FormField";

const PAGE_SIZE = 8;

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
        className="h-11 w-11 rounded-lg border border-edge object-cover"
      />
    );
  }

  const Icon = category ? CATEGORY_ICONS[category.icon] : Package;

  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-lg border border-dashed border-edge bg-surface text-muted"
      style={{
        backgroundColor: category?.tint ?? undefined,
      }}
    >
      {Icon ? <Icon size={19} /> : <ImageIcon size={17} />}
    </div>
  );
}

export function AdminProductsPage() {
  const { t, language, isArabic, unitName, money } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const stockParam = searchParams.get("stock");
  const stockFilter = stockParam === "out" || stockParam === "low" ? stockParam : undefined;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setCurrentPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data: categoryResult } = useAdminCategories({ page: 1, limit: 100 });
  const categories = categoryResult?.data ?? [];
  const { data: productResult, isLoading, isError, error } = useAdminProducts({
    page: currentPage, limit: PAGE_SIZE, search: debouncedSearch,
    category: categoryId || undefined, archived: showArchived, stock: stockFilter, sort: "oldest",
  });
  const products = productResult?.data ?? [];
  const pagination = productResult?.pagination;
  const filteredProducts = products;
  const paginatedProducts = products;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const restore = useRestoreProduct();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

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

  const productName = (product: Product) => localizedName(product, language);

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t("admin.products.title")}
        text={t("admin.products.text")}
        action={
          <button
            type="button"
            onClick={() => openForm("new")}
            disabled={categories.length === 0}
            title={
              categories.length === 0
                ? t("admin.products.createCategoryFirst")
                : undefined
            }
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
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Plus size={17} />
            {t("admin.products.add")}
          </button>
        }
      />

      {/* Product Count */}
      {!isLoading && (
        <div className="rounded-xl border border-edge bg-white px-5 py-4">
          <p className="text-sm text-muted">{t("admin.products.title")}</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
            {pagination?.total ?? 0}
          </p>
        </div>
      )}

      {/* Active products / archive */}
      <div className="flex gap-2">
        <button type="button" onClick={() => { setShowArchived(false); setCurrentPage(1); }} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${!showArchived ? "border-brand bg-brand text-white" : "border-edge bg-white text-muted"}`}>Active products</button>
        <button type="button" onClick={() => { setShowArchived(true); setCurrentPage(1); }} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${showArchived ? "border-brand bg-brand text-white" : "border-edge bg-white text-muted"}`}>Archived products</button>
      </div>

      {stockFilter && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm ${stockFilter === "out" ? "border-[#efd8d5] bg-[#fff7f6]" : "border-[#f0e2c6] bg-[#fffaf1]"}`}>
          <span className={`font-medium ${stockFilter === "out" ? "text-[#713c37]" : "text-[#614b26]"}`}>{stockFilter === "out" ? "Showing all out-of-stock products" : "Showing all low-stock products"}</span>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("stock");
              setSearchParams(next, { replace: true });
              setCurrentPage(1);
            }}
            className="font-semibold text-[#8d4038] underline underline-offset-2"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.products.searchByName")}
            className={`${inputClass} ps-9`}
          />
        </label>

        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setCurrentPage(1);
          }}
          className={`
            ${inputClass}
            w-full cursor-pointer
            sm:w-56
          `}
          aria-label={t("admin.products.filterCategory")}
        >
          <option value="">{t("admin.products.allCategories")}</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {localizedName(category, language)}
            </option>
          ))}
        </select>

        <span className="shrink-0 text-sm text-muted">
          {t("admin.products.count", {
            count: pagination?.total ?? 0,
          })}
        </span>
      </div>

      {/* Loading */}
      {isLoading && <TableSkeleton />}
      {isError && <Message title="Could not load products" text={error instanceof Error ? error.message : "Please try again."} />}

      {/* Empty State */}
      {!isLoading && !isError && (pagination?.total ?? 0) === 0 && (
        <div className="rounded-xl border border-edge bg-white p-8">
          <Message
            title={
              search || categoryId
                ? t("admin.products.none")
                : t("admin.products.none")
            }
            text={t("admin.products.noneText")}
          />

          {(pagination?.total ?? 0) === 0 && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => openForm("new")}
                disabled={categories.length === 0}
                className="
                  inline-flex h-10 cursor-pointer items-center gap-2
                  rounded-lg bg-brand px-4
                  text-sm font-semibold text-white
                  transition hover:bg-brand-dark
                  focus:outline-none focus:ring-2
                  focus:ring-brand focus:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                <Plus size={16} />
                {t("admin.products.add")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products Table */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-edge bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colImage")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colProduct")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colCategory")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colPrice")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colDiscount")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colStockAlert")}
                  </th>

                  <th className="px-5 py-3.5 text-start">
                    {t("admin.products.colStock")}
                  </th>

                  <th className="px-5 py-3.5 text-end">{t("actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-edge">
                {paginatedProducts.map((product) => {
                  const category = categoryOf(product.categoryId);
                  const name = productName(product);

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors duration-150 hover:bg-surface/70"
                    >
                      {/* Product Image */}
                      <td className="px-5 py-4">
                        <ProductImage product={product} category={category} />
                      </td>

                      {/* Product Name */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-brand">{name}</p>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        {category ? (
                          <span className="text-sm text-brand">
                            {localizedName(category, language)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">
                            {t("admin.products.unknown")}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-brand">
                          {money(product.price)}
                        </span>

                        <span className="ms-1 text-xs text-muted">
                          /{" "}
                          {product.unit === "kg"
                            ? `0.25 ${unitName("kg")}`
                            : unitName(product.unit)}
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-4">
                        {product.discount > 0 ? (
                          <span className="rounded-full bg-[#EAF6EE] px-2.5 py-1 text-xs font-semibold text-[#078A4B]">
                            -{product.discount}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted">
                            {t("admin.products.noDiscount")}
                          </span>
                        )}
                      </td>

                      {/* Stock Alert */}
                      <td className="whitespace-nowrap px-5 py-4">
                        {product.minQuantity > 0 ? (
                          <span className="text-sm text-brand">
                            {formatPrice(product.minQuantity).replace(
                              /\.00$/,
                              "",
                            )}{" "}
                            {unitName(product.unit)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">
                            {t("admin.products.noStockAlert")}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={
                            product.stockQuantity <= 0
                              ? "font-semibold text-sale"
                              : "text-sm text-brand"
                          }
                        >
                          {formatPrice(product.stockQuantity).replace(
                            /\.00$/,
                            "",
                          )}{" "}
                          {unitName(product.unit)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(product)}
                            aria-label={t("admin.editLabel", {
                              name,
                            })}
                            title={t("admin.editLabel", {
                              name,
                            })}
                            className="
                              grid h-9 w-9 cursor-pointer
                              place-items-center rounded-lg
                              border border-edge bg-white
                              text-muted
                              transition-all duration-150
                              hover:border-brand
                              hover:bg-brand
                              hover:text-white
                              active:scale-95
                              focus:outline-none
                              focus:ring-2 focus:ring-brand
                              focus:ring-offset-2
                            "
                          >
                            <Pencil size={16} />
                          </button>

                          {showArchived ? (
                            <button type="button" onClick={() => restore.mutate(product.id)} title="Restore product" aria-label="Restore product" className="grid h-9 w-9 place-items-center rounded-lg border border-edge bg-white text-muted transition hover:border-brand hover:bg-brand hover:text-white">
                              <ArchiveRestore size={16} />
                            </button>
                          ) : (
                            <button type="button" onClick={() => openDelete(product)} aria-label={`Archive ${name}`} title="Move to archive" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition hover:border-amber-500 hover:bg-amber-500 hover:text-white">
                              <Archive size={16} />
                            </button>
                          )}
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
            itemLabel="products"
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      {editing && (
        <Modal
          title={
            editing === "new"
              ? t("admin.products.add")
              : t("admin.products.edit")
          }
          onClose={() => setEditing(null)}
        >
          <ProductForm
            key={editing === "new" ? "new-product" : editing.id}
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

      {/* Delete Confirmation */}
      {deleting && (
        <ConfirmDialog
          title="Archive product"
          text={`Move ${localizedName(deleting, language)} to the archive? It will no longer appear in the shop, and existing order history will remain intact.`}
          confirmLabel="Move to archive"
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
