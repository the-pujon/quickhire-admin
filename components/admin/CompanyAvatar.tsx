const COLORS = [
  "from-indigo-100 to-indigo-200 text-indigo-700",
  "from-violet-100 to-violet-200 text-violet-700",
  "from-sky-100 to-sky-200 text-sky-700",
  "from-emerald-100 to-emerald-200 text-emerald-700",
  "from-amber-100 to-amber-200 text-amber-700",
  "from-rose-100 to-rose-200 text-rose-700",
];

export default function CompanyAvatar({ name }: { name: string }) {
  const letters = name.slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-[11px] font-bold shrink-0 select-none`}
    >
      {letters}
    </div>
  );
}
