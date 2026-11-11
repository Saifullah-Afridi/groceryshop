import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";

// Pop-up window. Closes with the X button, the Escape key, or a click outside.
const WIDTHS = { md: "max-w-xl", lg: "max-w-2xl" };

export function Modal({ title, onClose, size = "md", children }: { title: string; onClose: () => void; size?: "md" | "lg"; children: ReactNode }) {
  const { t } = useLanguage();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-forest/55 backdrop-blur-[2px]" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative max-h-[92vh] w-full ${WIDTHS[size]} overflow-y-auto rounded-2xl border border-edge bg-white p-7 shadow-2xl ${size === "lg" ? "sm:p-9" : ""}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-forest-2">{title}</h2>
          <button onClick={onClose} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
