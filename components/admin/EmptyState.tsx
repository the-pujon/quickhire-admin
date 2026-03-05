import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] text-slate-500 max-w-[280px] leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold h-9 px-5 rounded-lg transition-colors shadow-sm shadow-indigo-200/60"
        >
          <Plus className="w-3.5 h-3.5" />
          {action.label}
        </button>
      )}
    </div>
  );
}
