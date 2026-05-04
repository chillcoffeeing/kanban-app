import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import { useBoardStore } from "@/stores/boardStore";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import {
  TrashIcon,
  UserPlusIcon,
  UserIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { PERMISSIONS } from "@/shared/utils/constants";
import type { BoardMember, Permission } from "@/shared/types/domain";
import { api } from "@/services/api";
import MembersList from "@/components/membersPage/MembersList";

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

export function BoardMembersPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const { addMember, removeMember, updateMemberPermissions } = useBoardStore();
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const log = useActivity(boardId);

  useEffect(() => {
    if (!boardId) return;
    const controller = new AbortController();

    api<PendingInvitation[]>(`/boards/${boardId}/invitations`, {
      signal: controller.signal,
    })
      .then(setPendingInvites)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPendingInvites([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [boardId]);

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
    removeMember(boardId, member.id);
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
      await api<void>(`/invitations/${invitationId}`, { method: "DELETE" });
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== invitationId),
      );
      log(ACTIVITY_TYPES.MEMBER_REMOVED, `eliminó la invitación de "${email}"`);
    } catch (err) {
      // Error handled silently
    }
  };

  const togglePermission = (membershipId: string, permission: Permission) => {
    const member = currentBoard.members.find((m) => m.id === membershipId);
    if (!member) return;
    const has = member.permissions.includes(permission);
    const perms = has
      ? member.permissions.filter((p) => p !== permission)
      : [...member.permissions, permission];
    updateMemberPermissions(boardId, membershipId, perms);
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
            <UserPlusIcon size={20} weight="duotone" /> Invitar
          </Button>
        </form>
      </div>

      <div className="pt-4 border-t border-border-default">
        <h3 className="mb-3 text-content font-semibold text-fg-default">
          Miembros actuales
        </h3>
        <div className="flex flex-col gap-3">
          <MembersList
            members={currentBoard.members}
            handleRemoveMember={handleRemoveMember}
            togglePermission={togglePermission}
          />
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="pt-4 border-t border-border-default">
          <h3 className="mb-3 text-content font-semibold text-fg-default flex items-center gap-2">
            <ClockIcon size={18} weight="duotone" />
            Invitaciones pendientes
          </h3>
          <div className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="rounded-card border border-border-default p-3 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-muted">
                      <UserIcon size={20} className="text-fg-muted" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-content font-medium text-fg-default">
                          {inv.email}
                        </span>
                        <span className="rounded-pill bg-yellow-100 px-2 py-0.5 text-card-meta text-yellow-700">
                          Pendiente
                        </span>
                        <span className="rounded-pill bg-bg-muted px-2 py-0.5 text-card-meta text-fg-muted">
                          {inv.role}
                        </span>
                      </div>
                      <p className="text-card-meta text-fg-subtle">
                        Invitado: {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteInvitation(inv.id, inv.email)}
                    className="cursor-pointer text-fg-muted hover:text-red-500"
                  >
                    <TrashIcon size={20} weight="duotone" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
