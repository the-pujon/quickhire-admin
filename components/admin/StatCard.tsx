import { ArrowUpRight } from "lucide-react";

const STAT_CFG = {
  indigo: {
    wrap: "bg-indigo-50",
    icon: "text-indigo-600",
    trend: "bg-emerald-50 text-emerald-600",
  },
  emerald: {
    wrap: "bg-emerald-50",
    icon: "text-emerald-600",
    trend: "bg-emerald-50 text-emerald-600",
  },
  violet: {
    wrap: "bg-violet-50",
    icon: "text-violet-600",
    trend: "bg-emerald-50 text-emerald-600",
  },
} as const;

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  isLoading: boolean;
  color: keyof typeof STAT_CFG;
  trend?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  color,
  trend,
}: StatCardProps) {
  const c = STAT_CFG[color];
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md hover:shadow-slate-100 transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`${c.wrap} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.trend}`}
          >
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-8 w-14 bg-slate-100 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
          {value.toLocaleString()}
        </p>
      )}
      <p className="text-[13px] text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}
