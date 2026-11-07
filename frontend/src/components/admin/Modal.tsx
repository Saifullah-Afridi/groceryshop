import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

// Pop-up window. Closes with the X button, the Escape key, or a click outside.
const WIDTHS = { md: "max-w-xl", lg: "max-w-2xl" };

export function Modal({ title, onClose, size = "md", children }: { title: string; onClose: () => void; size?: "md" | "lg"; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative max-h-[90vh] w-full ${WIDTHS[size]} overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${size === "lg" ? "sm:p-8" : ""}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
