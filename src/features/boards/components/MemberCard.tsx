import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserIcon, TrashIcon } from "@phosphor-icons/react";
import type { BoardMember, Permission } from "@/shared/types/domain";
import { PERMISSION_LABELS } from "@/shared/utils/constants";

interface MemberCardProps {
  member: BoardMember;
  canManage: boolean;
  onRemove: (member: BoardMember) => void;
  onTogglePermission: (memberId: string, permission: Permission) => void;
}

export function MemberCard({ member, canManage, onRemove, onTogglePermission }: MemberCardProps) {
  const formatDate = (d: string) => format(new Date(d), "P", { locale: es });

  return (
    <div className="rounded-lg border border-neutral-light p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {member.user?.avatarUrl ? (
            <img
              src={member.user.avatarUrl}
              alt={member.user.name}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-neutral-light-hover">
              <UserIcon size={20} className="text-neutral-dark" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-dark">
                {member.user?.name || member.email || "Propietario"}
              </span>
              <span className="rounded bg-neutral-light/50 px-1.5 py-0.5 text-xs text-neutral-dark">
                {member.role}
              </span>
            </div>
            {member.user?.createdAt && (
              <p className="text-xs text-neutral-dark">
                Miembro desde{" "}
                {formatDate(member.user!.createdAt!)}
              </p>
            )}
            {member.invitedAt && (
              <p className="text-xs text-neutral-dark">
                Invitado:{" "}
                {formatDate(member.invitedAt)}
              </p>
            )}
          </div>
        </div>
        {member.role !== "owner" && canManage && (
          <button
            onClick={() => onRemove(member)}
            className="cursor-pointer text-danger hover:text-danger-hover"
          >
            <TrashIcon size={20} weight="duotone" />
          </button>
        )}
      </div>
      {member.role !== "owner" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            Object.entries(PERMISSION_LABELS) as Array<
              [Permission, string]
            >
          ).map(([perm, label]) => (
            <label
              key={perm}
              className="flex items-center gap-1 text-xs text-neutral-dark cursor-pointer"
            >
              <input
                type="checkbox"
                checked={member.permissions.includes(perm)}
                onChange={() => onTogglePermission(member.id, perm)}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
