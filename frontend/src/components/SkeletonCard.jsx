export const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
    <div className="aspect-[4/5] skeleton-shimmer"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton-shimmer rounded-full w-3/4 mx-auto"></div>
      <div className="h-4 skeleton-shimmer rounded-full w-1/2 mx-auto"></div>
    </div>
  </div>
);