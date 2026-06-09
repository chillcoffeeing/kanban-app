import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { UserPlusIcon, ClockIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useBoardStore } from "@/stores/boardStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { useAuthStore } from "@/stores/authStore";
import { canManageMembers } from "../utils/boardPreferences";
import { handleError } from "@/shared/utils/errorHandler";
import { ApiClient } from "@/services/api";
import type { Board, BoardMember, Permission } from "@/shared/types/domain";
import { MemberCard } from "./MemberCard";
import { PendingInvitationCard, type PendingInvitation } from "./PendingInvitationCard";

interface MembersTabProps {
  board: Board;
}

export function MembersTab({ board }: MembersTabProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const { addMember, removeMember, updateMemberPermissions } = useBoardStore();
  const log = useActivity(board.id);
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageMembers(board, currentUser?.id);

  useEffect(() => {
    if (!board?.id) return;
    ApiClient.get<PendingInvitation[]>(`/boards/${board.id}/invitations`)
      .then(setPendingInvites)
      .catch(() => setPendingInvites([]));
  }, [board?.id]);

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const email = inviteEmail.trim();
    addMember(board.id, email);
    log(ACTIVITY_TYPES.MEMBER_INVITED, `invitó a "${email}" al tablero`);
    setInviteEmail("");
  };

  const handleRemoveMember = (member: BoardMember) => {
    removeMember(board.id, member.id);
    log(
      ACTIVITY_TYPES.MEMBER_REMOVED,
      `eliminó a "${member.email}" del tablero`,
    );
  };

  const handleDeleteInvitation = async (
    invitationId: string,
    email: string,
  ) => {
    try {
      await ApiClient.delete(`/invitations/${invitationId}`);
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== invitationId),
      );
      log(ACTIVITY_TYPES.MEMBER_REMOVED, `eliminó la invitación de "${email}"`);
    } catch (err) {
      handleError(err, "Error al eliminar la invitación");
    }
  };

  const togglePermission = (membershipId: string, permission: Permission) => {
    const member = board.members.find((member) => member.id === membershipId);
    if (!member) return;
    const has = member.permissions.includes(permission);
    const perms = has
      ? member.permissions.filter((perm) => perm !== permission)
      : [...member.permissions, permission];
    updateMemberPermissions(board.id, membershipId, perms);
  };

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <form onSubmit={handleInvite} className="flex items-end gap-2">
          <Input
            label="Invitar por email"
            placeholder="email@ejemplo.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="md">
            <UserPlusIcon size={20} weight="duotone" /> Invitar
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border border-neutral-light bg-neutral-light/50 p-3 text-xs text-neutral-dark/60">
          Solo el propietario puede gestionar miembros en este
          tablero (preferencia{" "}
          <strong>Añadir y eliminar miembros</strong> = Solo
          propietario).
        </p>
      )}

      <div className="flex flex-col gap-3">
        {board.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            canManage={canManage}
            onRemove={handleRemoveMember}
            onTogglePermission={togglePermission}
          />
        ))}
      </div>

      {pendingInvites.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-light">
          <h4 className="mb-3 text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <ClockIcon size={18} weight="duotone" />
            Invitaciones pendientes
          </h4>
          <div className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <PendingInvitationCard
                key={inv.id}
                invitation={inv}
                onDelete={handleDeleteInvitation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
