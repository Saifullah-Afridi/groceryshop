import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Apple, Carrot, Leaf } from "lucide-react";
import "./loaders.css";

const MIN_VISIBLE_MS = 650;

export function GlobalLoader() {
  const { pathname } = useLocation();
  const fetching = useIsFetching({ predicate: (query) => query.state.data === undefined }) > 0;
  const [visible, setVisible] = useState(true);
  const shownAt = useRef(Date.now());
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; }
    else if (fetching) { shownAt.current = Date.now(); setVisible(true); }
  }, [pathname, fetching]);

  useEffect(() => {
    if (fetching) { setVisible(true); return; }
    if (!visible) return;
    const delay = Math.max(180, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const timer = window.setTimeout(() => setVisible(false), delay);
    return () => window.clearTimeout(timer);
  }, [fetching, visible]);

  if (!visible) return null;
  return (
    <div role="status" aria-live="polite" aria-label="Preparing your fresh groceries" className="fixed inset-0 z-[100] grid place-items-center bg-[#fbfdfb]">
      <div className="flex flex-col items-center">
        <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] border border-green-100 bg-white shadow-[0_12px_40px_rgba(19,128,64,0.10)]">
          <div className="fresh-loader-ring absolute inset-2 rounded-full border-2 border-dashed border-green-200" />
          <Apple className="absolute left-5 top-5 text-red-500" size={22} strokeWidth={1.8} />
          <Carrot className="absolute bottom-5 right-5 text-orange-500" size={25} strokeWidth={1.8} />
          <Leaf className="text-brand fresh-loader-leaf" size={34} strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-base font-extrabold tracking-tight text-brand">Rakan</p>
        <p className="mt-1 text-xs font-medium tracking-wide text-muted">Preparing freshness for you...</p>
        <div className="mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-green-100"><span className="fresh-loader-bar block h-full rounded-full bg-brand" /></div>
      </div>
    </div>
  );
}
