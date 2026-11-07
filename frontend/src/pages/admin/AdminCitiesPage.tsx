import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { CityForm } from "../../components/admin/CityForm";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useAdminCities, useDeleteCity, useSaveCity } from "../../hooks/useAdmin";
import type { City } from "../../types/order";
import { formatPrice } from "../../utils/format";

export function AdminCitiesPage() {
  const { data: cities = [], isLoading } = useAdminCities();
  const save = useSaveCity();
  const remove = useDeleteCity();
  const [editing, setEditing] = useState<City | "new" | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const openForm = (value: City | "new") => { save.reset(); setEditing(value); };
  const openDelete = (value: City) => { remove.reset(); setDeleting(value); };

  return (
    <>
      <PageHeader
        title="Delivery"
        text="The cities we deliver to and the delivery fee added to each order."
        action={
          <button onClick={() => openForm("new")} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
            <Plus size={16} /> Add city
          </button>
        }
      />

      {isLoading && <TableSkeleton />}
      {!isLoading && cities.length === 0 && <Message title="No delivery cities yet" text="Shoppers cannot check out until you add at least one city." />}
      {cities.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-card text-xs text-muted">
              <tr><th className="px-4 py-3">City</th><th className="px-4 py-3">Delivery fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cities.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{formatPrice(c.fee)} JOD</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.active ? "bg-green-50 text-green-700" : "bg-card text-muted"}`}>
                      {c.active ? "Delivering" : "Paused"}
                    </span>
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
        <Modal title={editing === "new" ? "Add city" : "Edit city"} onClose={() => setEditing(null)}>
          <CityForm
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
          title="Delete city"
          text={`Delete ${deleting.name}? Old orders keep the fee they were placed with. To stop deliveries for a while, edit the city and turn delivery off instead.`}
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
