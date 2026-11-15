import {
  Image as ImageIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TableSkeleton } from "../../components/Skeleton";
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

  const { data: categories = [] } = useAdminCategories();
  const { data: products = [], isLoading } = useAdminProducts();

  const save = useSaveProduct();
  const remove = useDeleteProduct();

  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === categoryId;

      const searchableText = [
        product.name,
        product.nameAr ?? "",
        product.description ?? "",
        product.descriptionAr ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !text || searchableText.includes(text);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Return to the last available page if products are deleted or filtered.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
            {products.length}
          </p>
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
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={t("admin.products.search")}
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
            count: filteredProducts.length,
          })}
        </span>
      </div>

      {/* Loading */}
      {isLoading && <TableSkeleton />}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="rounded-xl border border-edge bg-white p-8">
          <Message
            title={
              search || categoryId
                ? t("admin.products.none")
                : t("admin.products.none")
            }
            text={t("admin.products.noneText")}
          />

          {products.length === 0 && (
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
                    {t("admin.products.colDescription")}
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

                      {/* Description */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="line-clamp-2 text-xs leading-5 text-muted">
                          {localizedDescription(product, language) ||
                            t("admin.products.noDescription")}
                        </p>
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

                          <button
                            type="button"
                            onClick={() => openDelete(product)}
                            aria-label={t("admin.deleteLabel", {
                              name,
                            })}
                            title={t("admin.deleteLabel", {
                              name,
                            })}
                            className="
                              grid h-9 w-9 cursor-pointer
                              place-items-center rounded-lg
                              border border-edge bg-white
                              text-muted
                              transition-all duration-150
                              hover:border-red-500
                              hover:bg-red-500
                              hover:text-white
                              active:scale-95
                              focus:outline-none
                              focus:ring-2 focus:ring-red-300
                              focus:ring-offset-2
                            "
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
            totalItems={filteredProducts.length}
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
          title={t("admin.products.delete")}
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
