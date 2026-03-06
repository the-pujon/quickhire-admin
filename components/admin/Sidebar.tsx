"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, Plus, LogOut, Users, Zap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useGetAllApplicationsQuery } from "@/redux/api/jobBoardApi";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCurrentUser, logout as logoutAction } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/api/authApi";
import { toast } from "sonner";

const NAV_ICONS = {
  jobs: Briefcase,
  applications: Users,
  create: Plus,
  users: Users,
} as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: appsData } = useGetAllApplicationsQuery();
  const applicationCount = appsData?.data?.length ?? 0;
  const [logoutMutation] = useLogoutMutation();

  async function handleLogout() {
    onClose();
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore
    }
    dispatch(logoutAction());
    toast.success("Logged out successfully");
    router.push("/login");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "QA";

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-slate-100 flex flex-col",
        "transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-300/50 shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-[15px] tracking-tight leading-tight">
            QuickHire
          </p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pb-2.5">
          Management
        </p>
        {NAV_ITEMS.map(({ key, label, href }) => {
          const Icon = NAV_ICONS[key];
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              onClick={onClose}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium",
                "transition-all duration-150 group",
                active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300/40"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-4 h-4 shrink-0",
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
              />
              <span className="flex-1">{label}</span>
              {key === "applications" && applicationCount > 0 && (
                <span
                  className={[
                    "text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-indigo-100 text-indigo-700",
                  ].join(" ")}
                >
                  {applicationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
              {user?.name || "Admin"}
            </p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
