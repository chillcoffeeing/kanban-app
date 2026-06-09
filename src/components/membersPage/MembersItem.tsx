import { BoardMember, Permission } from "@/shared/types";
import { PERMISSION_LABELS } from "@/shared/utils/constants";
import { TrashIcon } from "@phosphor-icons/react/dist/icons/Trash";
import { UserIcon } from "@phosphor-icons/react/dist/icons/User";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useState } from "react";

export interface PendingRequest {
  id: string;
  requesterId: string;
  permission: string;
}

export default function MembersItem({
  member,
  togglePermission,
  handleRemoveMember,
  memberPendingRequests,
}: {
  member: BoardMember;
  togglePermission: (memberId: string, permission: Permission) => void;
  handleRemoveMember: (member: BoardMember) => void;
  memberPendingRequests: PendingRequest[];
}) {
  const [hoveredPerm, setHoveredPerm] = useState<{
    memberId: string;
    permission: string;
  } | null>(null);

  return (
    <div
      key={member.id}
      className="rounded-xl border border-neutral-light bg-surface p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {member.user?.avatarUrl ? (
            <img
              src={member.user.avatarUrl}
              alt={member.user.name}
              className="size-12 rounded-full object-cover ring-2 ring-neutral-light/50"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-neutral-light/70">
              <UserIcon size={24} className="text-neutral-dark/50" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-dark">
                {member.user?.name || member.email || "Propietario"}
              </span>
              <span className="rounded-full bg-neutral-light/70 px-2 py-0.5 text-xs text-neutral-dark/70">
                {member.role}
              </span>
            </div>
            {member.user?.createdAt && (
              <p className="mt-0.5 text-xs text-neutral-dark/60">
                Miembro desde{" "}
                {format(new Date(member.user!.createdAt!), "P", {
                  locale: es,
                })}
              </p>
            )}
            {member.invitedAt && (
              <p className="mt-0.5 text-xs text-neutral-dark/60">
                Invitado:{" "}
                {format(new Date(member.invitedAt!), "P", { locale: es })}
              </p>
            )}
          </div>
        </div>
        {member.role !== "owner" && (
          <button
            onClick={() => handleRemoveMember(member)}
            className="cursor-pointer text-neutral-dark/50 hover:text-danger transition-colors"
          >
            <TrashIcon size={18} weight="duotone" />
          </button>
        )}
      </div>
      {member.role !== "owner" && (
        <div className="mt-4 pt-3 border-t border-neutral-light/50">
          <p className="mb-2 text-xs font-medium text-neutral-dark/70">
            Permisos:
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              Object.entries(PERMISSION_LABELS) as Array<[Permission, string]>
            ).map(([perm, label]) => {
              const pendingReq = memberPendingRequests.find(
                (r) => r.permission === perm,
              );

              return (
                <div
                  key={perm}
                  className="relative"
                  onMouseEnter={() =>
                    setHoveredPerm({ memberId: member.id, permission: perm })
                  }
                  onMouseLeave={() => setHoveredPerm(null)}
                >
                  <label className="flex items-center gap-1.5 text-xs text-neutral-dark/70 cursor-pointer hover:text-neutral-dark transition-colors">
                    <span className="relative inline-flex">
                      <input
                        type="checkbox"
                        checked={member.permissions.includes(perm)}
                        onChange={() => togglePermission(member.id, perm)}
                        className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      {pendingReq && (
                        <span className="absolute -right-1.5 -top-1.5 flex size-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
                          <span className="relative inline-flex size-3 rounded-full bg-warning" />
                        </span>
                      )}
                    </span>
                    {label}
                  </label>

                  {pendingReq &&
                    hoveredPerm?.memberId === member.id &&
                    hoveredPerm?.permission === perm && (
                      <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2">
                        <div className="whitespace-nowrap rounded-lg bg-neutral-dark px-3 py-2 text-xs text-white shadow-lg">
                          Solicita permisos para{" "}
                          <span className="font-medium">
                            {label.toLowerCase()}
                          </span>
                        </div>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-dark" />
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
