import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
  onPageChange,
}: PaginationProps) {
  // Prevent invalid calculations
  const safeTotalItems = Math.max(0, Number(totalItems) || 0);
  const safePageSize = Math.max(1, Number(pageSize) || 1);
  const safeTotalPages = Math.max(
    1,
    Number(totalPages) || Math.ceil(safeTotalItems / safePageSize),
  );

  const safeCurrentPage = Math.min(
    Math.max(1, Number(currentPage) || 1),
    safeTotalPages,
  );

  const startItem =
    safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;

  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems);

  const getPages = (): (number | "...")[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", safeTotalPages];
    }

    if (safeCurrentPage >= safeTotalPages - 2) {
      return [
        1,
        "...",
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      safeTotalPages,
    ];
  };

  const buttonClass = `
    inline-flex h-9 min-w-9 cursor-pointer
    items-center justify-center rounded-lg
    border px-3 text-sm font-medium
    transition-all duration-150
    focus:outline-none focus:ring-2
    focus:ring-brand focus:ring-offset-1
  `;

  const inactiveClass = `
    border-edge bg-white text-muted
    hover:border-brand/40 hover:bg-surface
    hover:text-brand
  `;

  const disabledClass = `
    cursor-not-allowed border-edge
    bg-surface text-gray-300
  `;

  return (
    <div
      className="
      flex flex-wrap items-center justify-between
      gap-4 border-t border-edge bg-white
      px-5 py-4
    "
    >
      {/* Results Counter */}
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-ink">{startItem}</span>
        {"–"}
        <span className="font-semibold text-ink">{endItem}</span>
        {" of "}
        <span className="font-semibold text-ink">{safeTotalItems}</span>{" "}
        {itemLabel}
      </p>

      {/* Page Controls */}
      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center gap-1"
      >
        {/* Previous */}
        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className={`
            ${buttonClass}
            ${safeCurrentPage === 1 ? disabledClass : inactiveClass}
          `}
        >
          <ChevronLeft size={15} />
          <span className="ml-1">Previous</span>
        </button>

        {/* Page Numbers */}
        {getPages().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="
                  flex h-9 min-w-8 items-center
                  justify-center text-sm text-muted
                "
              >
                ...
              </span>
            );
          }

          const isActive = safeCurrentPage === page;

          return (
            <button
              key={page}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`
                ${buttonClass}
                ${
                  isActive
                    ? "border-brand bg-brand text-white shadow-sm"
                    : inactiveClass
                }
              `}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          disabled={safeCurrentPage === safeTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className={`
            ${buttonClass}
            ${
              safeCurrentPage === safeTotalPages ? disabledClass : inactiveClass
            }
          `}
        >
          <span className="mr-1">Next</span>
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  );
}
