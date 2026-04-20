export const SkeletonCard = () => (
  <div className="animate-pulse bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
    <div className="aspect-[4/5] bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);