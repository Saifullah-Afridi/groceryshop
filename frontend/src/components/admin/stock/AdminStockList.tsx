import {
  Archive,
  AlertCircle,
  AlertTriangle,
  Image as ImageIcon,
  Package,
  Pencil,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Message } from "../../Message";
import { TableSkeleton } from "../../Skeleton";
import { ConfirmDialog } from "../ConfirmDialog";
import { inputClass } from "../FormField";
import { Modal } from "../Modal";
import { PageHeader } from "../PageHeader";
import { Pagination } from "../Pagination";
import { ProductForm } from "../ProductForm";

import { useLanguage } from "../../../context/LanguageContext";
import {
  useAdminCategories,
  useAdminProducts,
  useDeleteProduct,
  useSaveProduct,
} from "../../../hooks/useAdmin";
import type { Category, Product } from "../../../types";
import { CATEGORY_ICONS } from "../../../utils/categoryIcons";
import { formatPrice } from "../../../utils/format";
import { localizedName } from "../../../utils/localized";

const PAGE_SIZE = 10;
export type StockPageKind = "out" | "low";

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
      style={{ backgroundColor: category?.tint ?? undefined }}
    >
      {Icon ? <Icon size={19} /> : <ImageIcon size={17} />}
    </div>
  );
}

export function AdminStockList({ kind }: { kind: StockPageKind }) {
  const { t, language, isArabic, unitName, money } = useLanguage();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState<Product | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data: categoryResult } = useAdminCategories({ page: 1, limit: 100 });
  const categories = categoryResult?.data ?? [];

  const {
    data: productResult,
    isLoading,
    isError,
    error,
  } = useAdminProducts({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    archived: false,
    stock: kind,
    sort: "oldest",
  });

  const products = productResult?.data ?? [];
  const pagination = productResult?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const save = useSaveProduct();
  const archive = useDeleteProduct();

  const isOut = kind === "out";
  const title = isOut ? "Out of Stock" : "Low Stock";
  const description = isOut
    ? "Products that have no available inventory."
    : "Products with stock at or below their configured alert threshold.";

  const categoryOf = (id: string) =>
    categories.find((category) => category.id === id);

  const productName = (product: Product) => localizedName(product, language);

  const openEdit = (product: Product) => {
    save.reset();
    setEditing(product);
  };

  const openArchive = (product: Product) => {
    archive.reset();
    setArchiving(product);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      <PageHeader
        title={title}
        text={description}
        action={
          <span
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
              isOut
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isOut ? <AlertCircle size={17} /> : <AlertTriangle size={17} />}
            {pagination?.total ?? 0} products
          </span>
        }
      />

      <label className="relative block max-w-lg">
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

      {isLoading && <TableSkeleton />}
      {isError && (
        <Message
          title="Could not load products"
          text={error instanceof Error ? error.message : "Please try again."}
        />
      )}

      {!isLoading && !isError && (pagination?.total ?? 0) === 0 && (
        <Message
          title={
            search
              ? "No matching products"
              : isOut
                ? "No out-of-stock products"
                : "No low-stock products"
          }
          text={
            search
              ? "Try another product name."
              : isOut
                ? "All active products currently have stock available."
                : "No active products are currently below their stock threshold."
          }
        />
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-edge bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                  <th className="px-5 py-3.5 text-start">Image</th>
                  <th className="px-5 py-3.5 text-start">Product</th>
                  <th className="px-5 py-3.5 text-start">Category</th>
                  <th className="px-5 py-3.5 text-start">Price</th>
                  <th className="px-5 py-3.5 text-start">Low-stock threshold</th>
                  <th className="px-5 py-3.5 text-start">Current stock</th>
                  <th className="px-5 py-3.5 text-end">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {products.map((product) => {
                  const category = categoryOf(product.categoryId);
                  const name = productName(product);

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors duration-150 hover:bg-surface/70"
                    >
                      <td className="px-5 py-4">
                        <ProductImage product={product} category={category} />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-brand">{name}</p>
                      </td>
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
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-brand">
                          {money(product.price)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-brand">
                        {formatPrice(product.minQuantity).replace(/\.00$/, "")} {unitName(product.unit)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`font-semibold ${
                            product.stockQuantity <= 0
                              ? "text-sale"
                              : "text-amber-700"
                          }`}
                        >
                          {formatPrice(product.stockQuantity).replace(/\.00$/, "")} {unitName(product.unit)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            aria-label={t("admin.editLabel", { name })}
                            title={t("admin.editLabel", { name })}
                            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition-all duration-150 hover:border-brand hover:bg-brand hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openArchive(product)}
                            aria-label={`Archive ${name}`}
                            title="Move to archive"
                            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition hover:border-amber-500 hover:bg-amber-500 hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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

      {editing && (
        <Modal
          title={t("admin.products.edit")}
          size="lg"
          onClose={() => setEditing(null)}
        >
          <ProductForm
            key={editing.id}
            initial={editing}
            categories={categories}
            saving={save.isPending}
            error={save.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={(input, imageFile) =>
              save.mutate(
                { id: editing.id, input, imageFile },
                { onSuccess: () => setEditing(null) },
              )
            }
          />
        </Modal>
      )}

      {archiving && (
        <ConfirmDialog
          title="Archive product"
          text={`Move ${localizedName(archiving, language)} to the archive? It will no longer appear in the shop, and existing order history will remain intact.`}
          confirmLabel="Move to archive"
          busy={archive.isPending}
          error={archive.error?.message}
          onCancel={() => setArchiving(null)}
          onConfirm={() =>
            archive.mutate(archiving.id, {
              onSuccess: () => setArchiving(null),
            })
          }
        />
      )}
    </div>
  );
}
