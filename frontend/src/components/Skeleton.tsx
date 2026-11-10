type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

// Product card loading placeholder
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E3EDE5] bg-white">
      {/* Image Placeholder */}
      <Skeleton className="h-48 rounded-none bg-[#E8F1E9] sm:h-52" />

      <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-4/5 bg-[#E8F1E9]" />

        <Skeleton className="h-3 w-1/2 bg-[#E8F1E9]" />

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-lg bg-[#E8F1E9]" />
          ))}
        </div>

        <Skeleton className="h-10 w-full rounded-xl bg-[#E8F1E9]" />

        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-7 w-20 bg-[#E8F1E9]" />
          <Skeleton className="h-10 w-28 rounded-xl bg-[#E8F1E9]" />
        </div>
      </div>
    </div>
  );
}

// Table loading placeholder
export function TableSkeleton() {
  return (
    <div className="w-full space-y-3" role="status" aria-label="Loading table">
      {/* Table Header */}
      <div className="flex gap-4 border-b border-gray-200 pb-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      {/* Table Rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      ))}
    </div>
  );
}
