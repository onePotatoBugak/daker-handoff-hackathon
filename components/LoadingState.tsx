export function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-16 mb-3" />
      <div className="h-5 bg-slate-800 rounded w-full mb-2" />
      <div className="h-5 bg-slate-800 rounded w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-slate-800 rounded-full w-12" />
        <div className="h-5 bg-slate-800 rounded-full w-14" />
      </div>
      <div className="h-4 bg-slate-800 rounded w-32" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="h-5 bg-slate-800 rounded w-8" />
      <div className="h-5 bg-slate-800 rounded flex-1" />
      <div className="h-5 bg-slate-800 rounded w-16" />
    </div>
  );
}
