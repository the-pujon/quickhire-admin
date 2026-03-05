export default function SkeletonRows() {
  return (
    <div className="p-4 space-y-2">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-3 py-3.5 animate-pulse"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-100 rounded-md w-48" />
            <div className="h-3 bg-slate-100 rounded-md w-32" />
          </div>
          <div className="h-6 w-20 bg-slate-100 rounded-full hidden sm:block" />
          <div className="h-6 w-16 bg-slate-100 rounded-full hidden md:block" />
          <div className="h-6 w-14 bg-slate-100 rounded-md hidden lg:block" />
        </div>
      ))}
    </div>
  );
}
