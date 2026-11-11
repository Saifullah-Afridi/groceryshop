import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { CustomerForm } from "../../components/admin/CustomerForm";
import { Modal } from "../../components/admin/Modal";
import { OrderDetails } from "../../components/admin/OrderDetails";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import { useAdminCustomerHistory, useAdminCustomers, useDeleteCustomer, useSaveCustomer } from "../../hooks/useAdmin";
import type { AdminCustomer } from "../../types/customer";

export function AdminCustomersPage() {
  const { t, date } = useLanguage();
  const { data: customers = [], isLoading } = useAdminCustomers();
  const save = useSaveCustomer();
  const remove = useDeleteCustomer();
  const [editing, setEditing] = useState<AdminCustomer | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<AdminCustomer | null>(null);
  const history = useAdminCustomerHistory(historyCustomer?.id ?? null);

  const openForm = (value: AdminCustomer | "new") => { save.reset(); setEditing(value); };
  const openDelete = (value: AdminCustomer) => { remove.reset(); setDeleting(value); };

  return (
    <>
      <PageHeader
        title={t("admin.users.title")}
        text={t("admin.users.text")}
        action={
          <button onClick={() => openForm("new")} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark">
            <Plus size={16} /> {t("admin.users.add")}
          </button>
        }
      />

      {isLoading && <TableSkeleton />}
      {!isLoading && customers.length === 0 && <Message title={t("admin.users.none")} text={t("admin.users.noneText")} />}
      {customers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-start text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr><th className="px-4 py-3 text-start">{t("admin.users.colUser")}</th><th className="px-4 py-3 text-start">{t("admin.users.colPhone")}</th><th className="px-4 py-3 text-start">{t("admin.users.colAddress")}</th><th className="px-4 py-3 text-start">{t("admin.users.colEmail")}</th><th className="px-4 py-3 text-end">{t("actions")}</th></tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3"><p className="font-semibold">{c.name}</p><p className="text-xs text-muted">{c.email}</p></td>
                  <td className="px-4 py-3">{c.phone || <span className="text-muted">{t("admin.users.notSet")}</span>}</td>
                  <td className="px-4 py-3"><p className="line-clamp-2 max-w-xs">{c.address}</p></td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {c.emailVerified ? t("admin.users.verified") : t("admin.users.notVerified")}
                    </span>
                    <p className="mt-1 text-xs text-muted">{t("admin.users.joined", { date: date(c.createdAt) })}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setHistoryCustomer(c)} aria-label={t("admin.users.historyButton")} title={t("admin.users.historyButton")} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"><Eye size={16} /></button>
                      <button onClick={() => openForm(c)} aria-label={t("admin.editLabel", { name: c.name })} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"><Pencil size={16} /></button>
                      <button onClick={() => openDelete(c)} aria-label={t("admin.deleteLabel", { name: c.name })} className="grid h-9 w-9 place-items-center rounded-lg text-sale hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historyCustomer && (
        <Modal title={t("admin.users.historyTitle", { name: historyCustomer.name })} size="lg" onClose={() => setHistoryCustomer(null)}>
          {history.isLoading && <p className="py-6 text-center text-sm text-muted">{t("admin.users.historyLoading")}</p>}
          {history.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{(history.error as Error).message}</p>}
          {history.data && (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-xl bg-surface p-4 text-sm sm:grid-cols-3">
                <p><span className="text-muted">{t("admin.users.historyEmail")}:</span> {history.data.customer.email}</p>
                <p><span className="text-muted">{t("admin.users.historyPhone")}:</span> {history.data.customer.phone || "—"}</p>
                <p><span className="text-muted">{t("admin.users.historyOrders")}:</span> {history.data.orders.length}</p>
              </div>
              {history.data.orders.length === 0 ? <p className="py-6 text-center text-sm text-muted">{t("admin.users.historyEmpty")}</p> : (
                <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                  {history.data.orders.map((order) => (
                    <section key={order.id} className="rounded-xl border border-edge p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">Order #{order.id}</h3>
                        <span className="text-xs text-muted">{date(order.createdAt)}</span>
                      </div>
                      <OrderDetails order={order} />
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {editing && (
        <Modal title={editing === "new" ? t("admin.users.add") : t("admin.users.edit")} onClose={() => setEditing(null)}>
          <CustomerForm
            initial={editing === "new" ? undefined : editing}
            saving={save.isPending}
            error={save.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={(input) => save.mutate({ id: editing === "new" ? undefined : editing.id, input }, { onSuccess: () => setEditing(null) })}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title={t("admin.users.delete")}
          text={t("admin.users.deleteText", { name: deleting.name, email: deleting.email })}
          confirmLabel={t("delete")}
          busy={remove.isPending}
          error={remove.error?.message}
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        />
      )}
    </>
  );
}
