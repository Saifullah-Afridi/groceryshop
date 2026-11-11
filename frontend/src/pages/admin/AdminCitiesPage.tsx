import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableSkeleton } from "../../components/Skeleton";
import { useState } from "react";
import { CityForm } from "../../components/admin/CityForm";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Modal } from "../../components/admin/Modal";
import { PageHeader } from "../../components/admin/PageHeader";
import { Message } from "../../components/Message";
import { useLanguage } from "../../context/LanguageContext";
import { useAdminCities, useDeleteCity, useSaveCity } from "../../hooks/useAdmin";
import type { City } from "../../types/order";

export function AdminCitiesPage() {
  const { t, money } = useLanguage();
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
        title={t("admin.cities.title")}
        text={t("admin.cities.text")}
        action={
          <button onClick={() => openForm("new")} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark">
            <Plus size={16} /> {t("admin.cities.add")}
          </button>
        }
      />

      {isLoading && <TableSkeleton />}
      {!isLoading && cities.length === 0 && <Message title={t("admin.cities.none")} text={t("admin.cities.noneText")} />}
      {cities.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-start text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr><th className="px-4 py-3 text-start">{t("admin.cities.colCity")}</th><th className="px-4 py-3 text-start">{t("admin.cities.colFee")}</th><th className="px-4 py-3 text-end">{t("actions")}</th></tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {cities.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{money(c.fee)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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

      {editing && (
        <Modal title={editing === "new" ? t("admin.cities.add") : t("admin.cities.edit")} onClose={() => setEditing(null)}>
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
          title={t("admin.cities.delete")}
          text={t("admin.cities.deleteText", { name: deleting.name })}
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
