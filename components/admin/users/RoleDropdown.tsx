"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { AdminUser } from "@/redux/api/authApi";

const ROLES = [
  "customer",
  "seller",
  "moderator",
  "admin",
  "superAdmin",
] as const;

interface RoleDropdownProps {
  user: AdminUser;
  onChangeRole: (email: string, newRole: string) => Promise<void>;
}

export function RoleDropdown({ user, onChangeRole }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function openDropdown() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  async function select(role: string) {
    if (role === user.role) {
      setOpen(false);
      return;
    }
    setOpen(false);
    setPending(true);
    await onChangeRole(user.email, role);
    setPending(false);
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={openDropdown}
        disabled={pending}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Change Role <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-[100] w-44 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/40 py-1.5"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => select(role)}
                className={`w-full text-left px-3.5 py-2 text-[12px] font-medium capitalize transition-colors ${
                  role === user.role
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
