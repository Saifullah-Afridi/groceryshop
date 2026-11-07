import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./loaders.css";

const SETTLE_MS = 120; // wait a moment after the last request, in case the page starts another one
const MIN_VISIBLE_MS = 400; // once shown, it stays long enough to be seen

// A spinner over the whole website. It is the FIRST thing people see:
//  - when the site opens or is refreshed, it covers the page from the very first paint until the data has loaded
//    (index.html shows the same spinner before React starts), so nobody sees empty pages or skeletons first;
//  - when another page opens and it needs data that is not saved yet, it covers that page the same way.
// Changing a filter or a search on the same page does not use it. The list shows a skeleton instead.
export function GlobalLoader() {
  const { pathname } = useLocation();
  const loading = useIsFetching({ predicate: (query) => query.state.data === undefined }) > 0;
  const [watching, setWatching] = useState(true); // true at the start: the site has just opened
  const [visible, setVisible] = useState(true);
  const shownAt = useRef(Date.now());
  const firstPage = useRef(true);

  // The spinner from index.html is already on screen. This one looks the same, so hand over without a flicker.
  useLayoutEffect(() => {
    document.getElementById("app-loader")?.remove();
  }, []);

  // Another page opened: watch its data too. This runs before the browser paints.
  useLayoutEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    setWatching(true);
  }, [pathname]);

  useEffect(() => {
    if (!watching) return;
    if (loading) {
      if (!visible) {
        shownAt.current = Date.now();
        setVisible(true);
      }
      return;
    }
    // Nothing is loading. Hide after a short moment (and not before the minimum time).
    const shownFor = Date.now() - shownAt.current;
    const wait = Math.max(SETTLE_MS, (visible ? MIN_VISIBLE_MS : 0) - shownFor);
    const timer = setTimeout(() => {
      setWatching(false);
      setVisible(false);
    }, wait);
    return () => clearTimeout(timer);
  }, [watching, loading, visible]);

  if (!visible) return null;
  return (
    <div role="status" aria-live="polite" aria-label="Loading" className="fixed inset-0 z-[70] grid place-items-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-brand" />
        <p className="text-sm font-medium text-brand">Loading...</p>
      </div>
    </div>
  );
}
