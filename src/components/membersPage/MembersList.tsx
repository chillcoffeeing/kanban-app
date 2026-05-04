import { BoardMember, Permission } from "@/shared/types";
import { PERMISSIONS } from "@/shared/utils/constants";
import { TrashIcon, UserIcon } from "@phosphor-icons/react";

export default function MembersList({
  members,
  handleRemoveMember,
  togglePermission,
}: {
  members: BoardMember[];
  handleRemoveMember: (member: BoardMember) => void;
  togglePermission: (memberId: string, permission: Permission) => void;
}) {
  const PERMISSION_LABELS: Record<Permission, string> = {
    [PERMISSIONS.CREATE_STAGE]: "Crear etapas",
    [PERMISSIONS.CREATE_CARD]: "Crear tarjetas",
    [PERMISSIONS.MODIFY_CARD]: "Modificar tarjetas",
    [PERMISSIONS.DELETE_CARD]: "Eliminar tarjetas",
    [PERMISSIONS.INVITE_MEMBER]: "Invitar miembros",
  };

  return members.map((member) => (
    <div
      key={member.id}
      className="rounded-card border border-border-default p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {member.user?.avatarUrl ? (
            <img
              src={member.user.avatarUrl}
              alt={member.user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-muted">
              <UserIcon size={20} className="text-fg-muted" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-content font-medium text-fg-default">
                {member.user?.name || member.email || "Propietario"}
              </span>
              <span className="rounded-pill bg-bg-muted px-2 py-0.5 text-card-meta text-fg-muted">
                {member.role}
              </span>
            </div>
            {member.user?.createdAt && (
              <p className="text-card-meta text-fg-subtle">
                Miembro desde{" "}
                {new Date(member.user!.createdAt!).toLocaleDateString()}
              </p>
            )}
            {member.invitedAt && (
              <p className="text-card-meta text-fg-subtle">
                Invitado: {new Date(member.invitedAt!).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {member.role !== "owner" && (
          <button
            onClick={() => handleRemoveMember(member)}
            className="cursor-pointer text-fg-muted hover:text-red-500"
          >
            <TrashIcon size={20} weight="duotone" />
          </button>
        )}
      </div>
      {member.role !== "owner" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            Object.entries(PERMISSION_LABELS) as Array<[Permission, string]>
          ).map(([perm, label]) => (
            <label
              key={perm}
              className="flex items-center gap-1 text-card-meta text-fg-muted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={member.permissions.includes(perm)}
                onChange={() => togglePermission(member.id, perm)}
                className="h-4 w-4 rounded border-border-default"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  ));
}
