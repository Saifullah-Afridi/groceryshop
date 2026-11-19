import { Pencil, Plus, Trash2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { TableSkeleton } from "../../components/Skeleton";
import { CityForm } from "../../components/admin/CityForm";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { Pagination } from "../../components/admin/Pagination";
import { Message } from "../../components/Message";

import { useLanguage } from "../../context/LanguageContext";
import {
  useAdminCities,
  useDeleteCity,
  useSaveCity,
} from "../../hooks/useAdmin";

import type { City } from "../../types/order";

const PAGE_SIZE = 8;

export function AdminCitiesPage() {
  const { t, money, isArabic } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: cityResult, isLoading, isError, error } = useAdminCities({ page: currentPage, limit: PAGE_SIZE });
  const cities = cityResult?.data ?? [];
  const pagination = cityResult?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  const paginatedCities = cities;
  const save = useSaveCity();
  const remove = useDeleteCity();
  const [editing, setEditing] = useState<City | "new" | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const openForm = (value: City | "new") => {
    save.reset();
    setEditing(value);
  };

  const openDelete = (value: City) => {
    remove.reset();
    setDeleting(value);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      <PageHeader
        title={t("admin.cities.title")}
        text={t("admin.cities.text")}
        action={
          <button
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
            <Plus size={16} />
            {t("admin.cities.add")}
          </button>
        }
      />

      {/* City count */}
      <div className="rounded-xl border border-edge bg-white px-5 py-4">
        <p className="text-sm text-muted">{t("admin.cities.title")}</p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
          {pagination?.total ?? 0}
        </p>
      </div>

      {/* Loading */}
      {isLoading && <TableSkeleton />}
      {isError && <Message title="Could not load delivery cities" text={error instanceof Error ? error.message : "Please try again."} />}

      {/* Empty state */}
      {!isLoading && !isError && cities.length === 0 && (
        <div className="rounded-xl border border-edge bg-white p-8">
          <Message
            title={t("admin.cities.none")}
            text={t("admin.cities.noneText")}
          />

          <div className="mt-5 flex justify-center">
            <button
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
                focus:outline-none
                focus:ring-2 focus:ring-brand
                focus:ring-offset-2
              "
            >
              <Plus size={16} />
              {t("admin.cities.add")}
            </button>
          </div>
        </div>
      )}

      {/* Cities table */}
      {!isLoading && !isError && cities.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-edge bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                    <th className="px-5 py-3.5 text-start">
                      {t("admin.cities.colCity")}
                    </th>

                    <th className="px-5 py-3.5 text-start">
                      {t("admin.cities.colFee")}
                    </th>

                    <th className="px-5 py-3.5 text-end">{t("actions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-edge">
                  {paginatedCities.map((city) => (
                    <tr
                      key={city.id}
                      className="transition-colors duration-150 hover:bg-surface/70"
                    >
                      {/* City name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge bg-surface text-brand">
                            <MapPin size={18} />
                          </div>

                          <span className="font-semibold text-brand">
                            {city.name}
                          </span>
                        </div>
                      </td>

                      {/* Delivery fee */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-brand">
                          {money(city.fee)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(city)}
                            aria-label={t("admin.editLabel", {
                              name: city.name,
                            })}
                            className="
                              grid h-9 w-9 cursor-pointer place-items-center
                              rounded-lg border border-edge bg-white
                              text-muted
                              transition-all duration-200
                              hover:border-brand hover:bg-brand hover:text-white
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
                            onClick={() => openDelete(city)}
                            aria-label={t("admin.deleteLabel", {
                              name: city.name,
                            })}
                            className="
                              grid h-9 w-9 cursor-pointer place-items-center
                              rounded-lg border border-edge bg-white
                              text-sale
                              transition-all duration-200
                              hover:border-sale hover:bg-sale hover:text-white
                              active:scale-95
                              focus:outline-none
                              focus:ring-2 focus:ring-sale
                              focus:ring-offset-2
                            "
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination?.total ?? 0}
            pageSize={PAGE_SIZE}
            itemLabel="cities"
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Add / Edit city modal */}
      {editing && (
        <Modal
          title={
            editing === "new" ? t("admin.cities.add") : t("admin.cities.edit")
          }
          onClose={() => setEditing(null)}
        >
          <CityForm
            initial={editing === "new" ? undefined : editing}
            saving={save.isPending}
            error={save.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={(input) =>
              save.mutate(
                {
                  id: editing === "new" ? undefined : editing.id,
                  input,
                },
                {
                  onSuccess: () => setEditing(null),
                },
              )
            }
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <ConfirmDialog
          title={t("admin.cities.delete")}
          text={t("admin.cities.deleteText", {
            name: deleting.name,
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
