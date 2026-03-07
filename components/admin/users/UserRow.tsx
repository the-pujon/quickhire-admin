import { CheckCircle, Trash2, XCircle } from "lucide-react";
import type { AdminUser } from "@/redux/api/authApi";
import { RoleBadge } from "./RoleBadge";
import { RoleDropdown } from "./RoleDropdown";
import { UserAvatar } from "./UserAvatar";

interface UserRowProps {
  user: AdminUser;
  canChangeRole: boolean;
  canDelete: boolean;
  onChangeRole: (email: string, newRole: string) => Promise<void>;
  onDelete: (user: AdminUser) => void;
}

export function UserRow({
  user,
  canChangeRole,
  canDelete,
  onChangeRole,
  onDelete,
}: UserRowProps) {
  return (
    <li className="grid grid-cols-1 md:grid-cols-[1fr_200px_120px_80px_140px] gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={user.name} />
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

      {/* Email — desktop only */}
      <p className="text-[12px] text-slate-500 truncate hidden md:block">
        {user.email}
      </p>

      {/* Role — desktop only */}
      <div className="hidden md:flex">
        <RoleBadge role={user.role} />
      </div>

      {/* Verified — desktop only */}
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
        {canChangeRole && (
          <RoleDropdown user={user} onChangeRole={onChangeRole} />
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(user)}
            title="Delete user"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
