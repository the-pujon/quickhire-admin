"use client";

import { useState } from "react";
import { Users, XCircle } from "lucide-react";
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
import { TablePagination } from "@/components/admin/TablePagination";
import { UserSearchBar } from "@/components/admin/users/UserSearchBar";
import { UserRow } from "@/components/admin/users/UserRow";
import { toast } from "sonner";

const LIMIT = 10;

export default function UsersPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isSuperAdmin = currentUser?.role === "superAdmin";

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

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

  function handleClearSearch() {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
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

      <UserSearchBar
        searchInput={searchInput}
        searchTerm={searchTerm}
        onSearchInputChange={setSearchInput}
        onSubmit={handleSearch}
        onClear={handleClearSearch}
      />

      {/* Table card */}
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
              <UserRow
                key={user._id}
                user={user}
                canChangeRole={
                  (isSuperAdmin || currentUser?.role === "admin") &&
                  user.role !== "superAdmin"
                }
                canDelete={isSuperAdmin && user.email !== currentUser?.email}
                onChangeRole={handleChangeRole}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        {!loading && totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            itemLabel="users"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
