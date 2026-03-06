"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import {
  useGetUsersQuery,
  useChangeRoleMutation,
  useDeleteUserMutation,
  type AdminUser,
} from "@/redux/api/authApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import PageHeader from "@/components/admin/PageHeader";
import SkeletonRows from "@/components/admin/SkeletonRows";
import EmptyState from "@/components/admin/EmptyState";
import { toast } from "sonner";

const ROLES = [
  "customer",
  "seller",
  "moderator",
  "admin",
  "superAdmin",
] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  superAdmin: "bg-purple-100 text-purple-700 border border-purple-200",
  admin: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  moderator: "bg-sky-100 text-sky-700 border border-sky-200",
  seller: "bg-amber-100 text-amber-700 border border-amber-200",
  customer: "bg-slate-100 text-slate-600 border border-slate-200",
};

function RoleBadge({ role }: { role: string }) {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

interface RoleDropdownProps {
  user: AdminUser;
  disabled: boolean;
  onChangeRole: (email: string, newRole: string) => Promise<void>;
}

function RoleDropdown({ user, disabled, onChangeRole }: RoleDropdownProps) {
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

  // Close on scroll so the menu doesn't float away
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
        disabled={disabled || pending}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          "Change Role"
        )}
        {!pending && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <>
          {/* Full-screen backdrop to catch outside clicks */}
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setOpen(false)}
          />
          {/* Menu rendered fixed above everything */}
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

export default function UsersPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isSuperAdmin = currentUser?.role === "superAdmin";

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, isFetching, isError, error } = useGetUsersQuery({
    page,
    limit: LIMIT,
    ...(searchTerm && { searchTerm }),
  });

  const [changeRole] = useChangeRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.data?.data ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  // Backend throws 409 when no users match the query — treat as empty, not error
  const is409 = isError && (error as { status?: number })?.status === 409;
  const hasError = isError && !is409;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  }

  async function handleChangeRole(email: string, newRole: string) {
    try {
      await changeRole({ email, newRole }).unwrap();
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to change role");
    }
  }

  async function handleDelete(user: AdminUser) {
    if (
      !confirm(
        `Delete user "${user.name}" (${user.email})? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteUser(user._id).unwrap();
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  }

  const loading = (isLoading || isFetching) && !isError;

  return (
    <div className="px-5 py-6 max-w-6xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle={`${total} registered user${total !== 1 ? "s" : ""} · manage roles and accounts`}
      />

      {/* Search + Stats row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 h-9 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-slate-400 transition"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200/60"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
                setPage(1);
              }}
              className="h-9 px-3 border border-slate-200 text-[12px] text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
        {searchTerm && (
          <p className="text-[12px] text-slate-500">
            Results for{" "}
            <span className="font-semibold text-slate-700">"{searchTerm}"</span>
          </p>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table head */}
        <div className="hidden md:grid grid-cols-[1fr_200px_120px_80px_140px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span className="text-center">Verified</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-[14px] font-semibold text-slate-700 mb-1">
              Failed to load users
            </p>
            <p className="text-[13px] text-slate-400">
              {(error as { data?: { message?: string } })?.data?.message ||
                "An error occurred. Please try again."}
            </p>
          </div>
        ) : users.length === 0 || is409 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={
              searchTerm
                ? `No users match "${searchTerm}". Try a different search.`
                : "There are no registered users yet."
            }
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {users.map((user) => (
              <li
                key={user._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_200px_120px_80px_140px] gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(
                      user.name,
                    )} flex items-center justify-center text-white text-[12px] font-bold shadow-sm shrink-0`}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                      {user.name}
                    </p>
                    {user.phone && (
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {user.phone}
                      </p>
                    )}
                    {user.createdAt && (
                      <p className="text-[10px] text-slate-300 leading-tight md:hidden">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <p className="text-[12px] text-slate-500 truncate hidden md:block">
                  {user.email}
                </p>

                {/* Role */}
                <div className="hidden md:flex">
                  <RoleBadge role={user.role} />
                </div>

                {/* Verified */}
                <div className="hidden md:flex justify-center">
                  {user.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                {/* Mobile: role + verified inline */}
                <div className="flex items-center gap-2 md:hidden">
                  <RoleBadge role={user.role} />
                  {user.isVerified ? (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  {/* Role change — admins can change non-superAdmin roles */}
                  {(isSuperAdmin || currentUser?.role === "admin") &&
                    user.role !== "superAdmin" && (
                      <RoleDropdown
                        user={user}
                        disabled={false}
                        onChangeRole={handleChangeRole}
                      />
                    )}
                  {/* Delete — superAdmin only, cannot delete self */}
                  {isSuperAdmin && user.email !== currentUser?.email && (
                    <button
                      onClick={() => handleDelete(user)}
                      title="Delete user"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[12px] text-slate-500">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (arr[idx - 1] as number) !== p - 1)
                    acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="text-[12px] text-slate-400 px-1"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                        page === p
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200/60"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
