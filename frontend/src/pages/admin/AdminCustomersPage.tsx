import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { CustomerForm } from "../../components/admin/CustomerForm";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useAdminCustomers, useDeleteCustomer, useSaveCustomer } from "../../hooks/useAdmin";
import type { AdminCustomer } from "../../types/customer";
import { formatDate } from "../../utils/format";

export function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useAdminCustomers();
  const save = useSaveCustomer();
  const remove = useDeleteCustomer();
  const [editing, setEditing] = useState<AdminCustomer | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null);

  const openForm = (value: AdminCustomer | "new") => { save.reset(); setEditing(value); };
  const openDelete = (value: AdminCustomer) => { remove.reset(); setDeleting(value); };

  return (
    <>
      <PageHeader
        title="Users"
        text="Shopper accounts. Deleting a user keeps their past orders."
        action={
          <button onClick={() => openForm("new")} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
            <Plus size={16} /> Add user
          </button>
        }
      />

      {isLoading && <div className="h-64 animate-pulse rounded-2xl bg-white" />}
      {!isLoading && customers.length === 0 && <Message title="No users yet" text="Accounts created on the website appear here." />}
      {customers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-card text-xs text-muted">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3"><p className="font-semibold">{c.name}</p><p className="text-xs text-muted">{c.email}</p></td>
                  <td className="px-4 py-3">{c.phone || <span className="text-muted">Not set</span>}</td>
                  <td className="px-4 py-3"><p className="line-clamp-2 max-w-xs">{c.address}</p></td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {c.emailVerified ? "Verified" : "Not verified"}
                    </span>
                    <p className="mt-1 text-xs text-muted">Joined {formatDate(c.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openForm(c)} aria-label={`Edit ${c.name}`} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-card"><Pencil size={16} /></button>
                      <button onClick={() => openDelete(c)} aria-label={`Delete ${c.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-sale hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add user" : "Edit user"} onClose={() => setEditing(null)}>
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
          title="Delete user"
          text={`Delete ${deleting.name} (${deleting.email})? They will no longer be able to sign in. Their past orders stay.`}
          confirmLabel="Delete"
          busy={remove.isPending}
          error={remove.error?.message}
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        />
      )}
    </>
  );
}
