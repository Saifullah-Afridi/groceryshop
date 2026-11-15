import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getSearchSuggestions } from "../services/productService";
import type { SearchSuggestions } from "../types";

interface Props {
  mobile?: boolean;
  currentQuery?: string;
}

export function NavbarSearch({ mobile = false, currentQuery = "" }: Props) {
  const { isArabic, t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState(currentQuery);
  const [results, setResults] = useState<SearchSuggestions>({ products: [], categories: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQuery(currentQuery), [currentQuery]);

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setResults({ products: [], categories: [] });
      setLoading(false);
      return;
    }
    let active = true;
    setResults({ products: [], categories: [] });
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getSearchSuggestions(term);
        if (active) setResults(data);
      } catch {
        if (active) setResults({ products: [], categories: [] });
      } finally {
        if (active) setLoading(false);
      }
    }, 220);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, open]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    setOpen(false);
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const chooseCategory = (id: string) => {
    setOpen(false);
    navigate(`/shop?category=${encodeURIComponent(id)}`);
  };

  const chooseProduct = (name: string) => {
    setOpen(false);
    navigate(`/shop?q=${encodeURIComponent(name)}`);
  };

  const hasResults = results.products.length > 0 || results.categories.length > 0;
  const fieldClass = mobile
    ? "mt-3 flex h-10 w-full items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50/80 px-4 transition focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10 sm:hidden"
    : "ml-auto hidden h-11 min-w-0 max-w-[560px] flex-1 items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50/80 px-4 transition focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10 sm:flex";

  return (
    <div ref={rootRef} className={`relative ${mobile ? "w-full sm:hidden" : "ml-auto min-w-0 max-w-[560px] flex-1"}`}>
      <form onSubmit={submit} role="search" className={fieldClass}>
        <Search size={mobile ? 17 : 19} className="shrink-0 text-neutral-500" />
        <input
          ref={inputRef}
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          placeholder={t("search")}
          autoComplete="off"
          aria-label={t("search")}
          aria-expanded={open && query.trim().length >= 2}
          aria-controls={listboxId}
          className="navbar-search-input w-full min-w-0 appearance-none rounded-none border-0 bg-transparent p-0 text-sm text-neutral-900 shadow-none outline-none ring-0 placeholder:text-neutral-400 focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0"
        />
        {query && <button type="button" aria-label={isArabic ? "مسح البحث" : "Clear search"} onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="text-neutral-400 hover:text-neutral-700">×</button>}
      </form>

      {open && query.trim().length >= 2 && (
        <div id={listboxId} role="listbox" className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl shadow-black/15">
          {loading && <p className="px-3 py-3 text-sm text-neutral-500">{isArabic ? "جارٍ البحث..." : "Searching..."}</p>}
          {!loading && !hasResults && <p className="px-3 py-3 text-sm text-neutral-500">{isArabic ? "لا توجد اقتراحات. اضغط Enter لعرض نتائج البحث." : "No quick matches. Press Enter to see search results."}</p>}

          {!loading && results.categories.length > 0 && (
            <div className="pb-1">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">{isArabic ? "الفئات" : "Categories"}</p>
              {results.categories.map((category) => (
                <button key={category.id} type="button" role="option" onClick={() => chooseCategory(category.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-green-50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-green-50 text-brand">{category.image ? <img src={category.image} alt="" className="h-full w-full object-cover" /> : <Search size={16} />}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">{isArabic ? category.nameAr || category.name : category.name}</span>
                  <span className="text-xs text-neutral-400">{isArabic ? "فئة" : "Category"}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.products.length > 0 && (
            <div className="border-t border-neutral-100 pb-1">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">{isArabic ? "المنتجات" : "Products"}</p>
              {results.products.map((product) => (
                <button key={product.id} type="button" role="option" onClick={() => chooseProduct(isArabic ? product.nameAr || product.name : product.name)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-green-50">
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">{product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-neutral-400">—</span>}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-800">{isArabic ? product.nameAr || product.name : product.name}</span>
                    <span className="block truncate text-xs text-neutral-400">{isArabic ? product.categoryNameAr || product.categoryName : product.categoryName}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-brand">{Number(product.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={() => { setOpen(false); const term = query.trim(); navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop"); }} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-3 text-sm font-bold text-brand transition hover:bg-green-100">
            {isArabic ? `عرض كل النتائج عن “${query.trim()}”` : `View all results for “${query.trim()}”`} <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
