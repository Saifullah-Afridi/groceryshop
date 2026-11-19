import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TableSkeleton } from "../../components/Skeleton";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { CustomerForm } from "../../components/admin/CustomerForm";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { Pagination } from "../../components/admin/Pagination";
import { Message } from "../../components/Message";

import { useLanguage } from "../../context/LanguageContext";
import {
  useAdminCustomers,
  useDeleteCustomer,
  useSaveCustomer,
} from "../../hooks/useAdmin";

import type { AdminCustomer } from "../../types/customer";

const PAGE_SIZE = 8;

export function AdminCustomersPage() {
  const { t, date, isArabic } = useLanguage();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: customerResult, isLoading, isError, error } = useAdminCustomers({ page: currentPage, limit: PAGE_SIZE });
  const customers = customerResult?.data ?? [];
  const pagination = customerResult?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  const paginatedCustomers = customers;
  const save = useSaveCustomer();
  const remove = useDeleteCustomer();
  const [editing, setEditing] = useState<AdminCustomer | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null);

  const openForm = (value: AdminCustomer | "new") => {
    save.reset();
    setEditing(value);
  };

  const openDelete = (value: AdminCustomer) => {
    remove.reset();
    setDeleting(value);
  };

  const openCustomer = (id: AdminCustomer["id"]) => {
    navigate(`/admin/users/${id}`);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      {/* Page header */}
      <PageHeader
        title={t("admin.users.title")}
        text={t("admin.users.text")}
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
            <Plus size={16} />
            {t("admin.users.add")}
          </button>
        }
      />

      {/* Customer count */}
      <div className="rounded-xl border border-edge bg-white px-5 py-4">
        <p className="text-sm text-muted">{t("admin.users.title")}</p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
          {pagination?.total ?? 0}
        </p>
      </div>

      {/* Loading */}
      {isLoading && <TableSkeleton />}
      {isError && <Message title="Could not load customers" text={error instanceof Error ? error.message : "Please try again."} />}

      {/* Empty state */}
      {!isLoading && !isError && customers.length === 0 && (
        <div className="rounded-xl border border-edge bg-white p-8">
          <Message
            title={t("admin.users.none")}
            text={t("admin.users.noneText")}
          />

          <div className="mt-5 flex justify-center">
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
                focus:outline-none
                focus:ring-2 focus:ring-brand
                focus:ring-offset-2
              "
            >
              <Plus size={16} />
              {t("admin.users.add")}
            </button>
          </div>
        </div>
      )}

      {/* Customers table */}
      {!isLoading && !isError && customers.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-edge bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                    <th className="px-5 py-3.5 text-start">
                      {t("admin.users.colUser")}
                    </th>

                    <th className="px-5 py-3.5 text-start">
                      {t("admin.users.colPhone")}
                    </th>

                    <th className="px-5 py-3.5 text-start">
                      {t("admin.users.colAddress")}
                    </th>

                    <th className="px-5 py-3.5 text-start">
                      {t("admin.users.colEmail")}
                    </th>

                    <th className="px-5 py-3.5 text-end">{t("actions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-edge">
                  {paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => openCustomer(customer.id)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          event.target === event.currentTarget
                        ) {
                          openCustomer(customer.id);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={t("admin.ud.viewCustomer", {
                        name: customer.name,
                      })}
                      className="
                        group cursor-pointer
                        transition-all duration-200 ease-in-out
                        hover:bg-green-50/70
                        focus:outline-none
                        focus:ring-2 focus:ring-inset focus:ring-brand
                      "
                    >
                      {/* Customer information */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              grid h-10 w-10 shrink-0 place-items-center
                              rounded-full border border-edge
                              bg-surface text-brand
                              transition-all duration-200 ease-in-out
                              group-hover:scale-110
                              group-hover:border-brand
                              group-hover:bg-brand
                              group-hover:text-white
                            "
                          >
                            <Users size={18} />
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                font-semibold text-brand
                                transition-all duration-200
                                group-hover:translate-x-0.5
                                group-hover:text-brand-dark
                              "
                            >
                              {customer.name}
                            </p>

                            <p
                              className="
                                mt-0.5 truncate text-xs text-muted
                                transition-colors duration-200
                                group-hover:text-brand
                              "
                            >
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        {customer.phone || (
                          <span className="text-muted">
                            {t("admin.users.notSet")}
                          </span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 max-w-xs text-sm text-brand">
                          {(isArabic ? (customer.addressAr || customer.address) : customer.address) || (
                            <span className="text-muted">
                              {t("admin.users.notSet")}
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Email verification and joined date */}
                      <td className="px-5 py-4">
                        <span
                          className={`
                            inline-flex rounded-full px-2.5 py-1
                            text-xs font-semibold
                            ${
                              customer.emailVerified
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }
                          `}
                        >
                          {customer.emailVerified
                            ? t("admin.users.verified")
                            : t("admin.users.notVerified")}
                        </span>

                        <p className="mt-1.5 text-xs text-muted">
                          {t("admin.users.joined", {
                            date: date(customer.createdAt),
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openForm(customer);
                            }}
                            aria-label={t("admin.editLabel", {
                              name: customer.name,
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
                            onClick={(event) => {
                              event.stopPropagation();
                              openDelete(customer);
                            }}
                            aria-label={t("admin.deleteLabel", {
                              name: customer.name,
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
            itemLabel="customers"
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Add / Edit customer modal */}
      {editing && (
        <Modal
          title={
            editing === "new" ? t("admin.users.add") : t("admin.users.edit")
          }
          onClose={() => setEditing(null)}
        >
          <CustomerForm
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
          title={t("admin.users.delete")}
          text={t("admin.users.deleteText", {
            name: deleting.name,
            email: deleting.email,
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
