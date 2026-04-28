import { useState } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import { useBoardStore } from "@/stores/boardStore";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Trash, UserPlus } from "@phosphor-icons/react";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { PERMISSIONS } from "@/shared/utils/constants";
import type { BoardMember, Permission } from "@/shared/types/domain";

const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.CREATE_STAGE]: "Crear etapas",
  [PERMISSIONS.CREATE_CARD]: "Crear tarjetas",
  [PERMISSIONS.MODIFY_CARD]: "Modificar tarjetas",
  [PERMISSIONS.DELETE_CARD]: "Eliminar tarjetas",
  [PERMISSIONS.INVITE_MEMBER]: "Invitar miembros",
};

export function BoardMembersPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [inviteEmail, setInviteEmail] = useState("");
  const {
    addMember,
    removeMember,
    updateMemberPermissions,
  } = useBoardStore();
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const log = useActivity(boardId);

  if (!currentBoard || !boardId) return null;

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const email = inviteEmail.trim();
    addMember(boardId, email);
    log(ACTIVITY_TYPES.MEMBER_INVITED, `invitó a "${email}" al tablero`);
    setInviteEmail("");
  };

  const handleRemoveMember = (member: BoardMember) => {
    removeMember(boardId, member.userId);
    log(
      ACTIVITY_TYPES.MEMBER_REMOVED,
      `eliminó a "${member.email}" del tablero`
    );
  };

  const togglePermission = (userId: string, permission: Permission) => {
    const member = currentBoard.members.find((m) => m.userId === userId);
    if (!member) return;
    const has = member.permissions.includes(permission);
    const perms = has
      ? member.permissions.filter((p) => p !== permission)
      : [...member.permissions, permission];
    updateMemberPermissions(boardId, userId, perms);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Invitar miembros
        </h3>
        <p className="mb-3 text-card-meta text-fg-subtle">
          Añade nuevos miembros al tablero por email.
        </p>
        <form onSubmit={handleInvite} className="flex items-end gap-2">
          <Input
            label="Email del nuevo miembro"
            placeholder="email@ejemplo.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="md">
            <UserPlus size={20} weight="duotone" /> Invitar
          </Button>
        </form>
      </div>

      <div className="pt-4 border-t border-border-default">
        <h3 className="mb-3 text-content font-semibold text-fg-default">
          Miembros actuales
        </h3>
        <div className="flex flex-col gap-3">
          {currentBoard.members.map((member) => (
            <div
              key={member.userId}
              className="rounded-card border border-border-default p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-content font-medium text-fg-default">
                    {member.email || "Propietario"}
                  </span>
                  <span className="ml-2 rounded-pill bg-bg-muted px-2 py-0.5 text-card-meta text-fg-muted">
                    {member.role}
                  </span>
                </div>
                {member.role !== "owner" && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="cursor-pointer text-fg-muted hover:text-red-500"
                  >
                    <Trash size={20} weight="duotone" />
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
                        onChange={() =>
                          togglePermission(member.userId, perm)
                        }
                        className="h-4 w-4 rounded border-border-default"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}