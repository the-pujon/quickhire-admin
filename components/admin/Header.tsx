"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/jobs": "Job Listings",
  "/applications": "Applications",
  "/create": "Post New Job",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-[57px] flex items-center gap-3 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">QuickHire</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {pathname === "/jobs" && (
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold h-8 px-3.5 rounded-lg transition-colors shadow-sm shadow-indigo-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Job
          </Link>
        )}
        <button
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer select-none">
          QA
        </div>
      </div>
    </header>
  );
}
