import { Shield } from "lucide-react";

export const ROLE_COLORS: Record<string, string> = {
  superAdmin: "bg-purple-100 text-purple-700 border border-purple-200",
  admin: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  moderator: "bg-sky-100 text-sky-700 border border-sky-200",
  seller: "bg-amber-100 text-amber-700 border border-amber-200",
  customer: "bg-slate-100 text-slate-600 border border-slate-200",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
        ROLE_COLORS[role] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {role === "superAdmin" && <Shield className="w-2.5 h-2.5" />}
      {role}
    </span>
  );
}
