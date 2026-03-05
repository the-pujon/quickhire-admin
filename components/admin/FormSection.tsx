interface FormSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}

export default function FormSection({
  icon: Icon,
  label,
  children,
}: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center">
          <Icon className="w-3 h-3 text-slate-500" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
