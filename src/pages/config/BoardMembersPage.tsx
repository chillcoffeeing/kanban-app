import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { handleError } from "@/shared/utils/errorHandler";
import type { BoardMember, Permission } from "@/shared/types/domain";
import { ApiClient } from "@/services/api";
import MembersList from "@/components/membersPage/MembersList";

interface PendingPermissionRequest {
  id: string;
  requesterId: string;
  permission: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

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
  const [pendingRequests, setPendingRequests] = useState<
    PendingPermissionRequest[]
  >([]);
  const { addMember, removeMember, updateMemberPermissions } = useBoardStore();
  const currentBoard = useBoardStore((boardState) => boardState.currentBoard);
  const log = useActivity(boardId);

  const fetchPendingRequests = useCallback(async () => {
    if (!boardId) return;
    try {
      const data = await ApiClient.get<PendingPermissionRequest[]>(
        `/boards/${boardId}/permission-requests`,
      );
      setPendingRequests(data ?? []);
    } catch {
      setPendingRequests([]);
    }
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;
    const controller = new AbortController();

    ApiClient.get<PendingInvitation[]>(`/boards/${boardId}/invitations`)
      .then(setPendingInvites)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPendingInvites([]);
        }
      });

    fetchPendingRequests();

    return () => {
      controller.abort();
    };
  }, [boardId, fetchPendingRequests]);

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
      await ApiClient.delete(`/invitations/${invitationId}`);
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== invitationId),
      );
      log(ACTIVITY_TYPES.MEMBER_REMOVED, `eliminó la invitación de "${email}"`);
    } catch (err) {
      handleError(err, "Error al eliminar la invitación");
    }
  };

  const togglePermission = async (
    membershipId: string,
    permission: Permission,
  ) => {
    const member = currentBoard.members.find(
      (member) => member.id === membershipId,
    );
    if (!member) return;
    const isAdding = !member.permissions.includes(permission);

    const pendingRequest = pendingRequests.find(
      (request) =>
        request.requesterId === membershipId &&
        request.permission === permission,
    );

    if (isAdding && pendingRequest) {
      try {
        await ApiClient.patch(
          `/boards/${boardId}/permission-requests/${pendingRequest.id}`,
          { status: "approved" },
        );
        setPendingRequests((previous) =>
          previous.filter((request) => request.id !== pendingRequest.id),
        );
      } catch {
        // Error handled silently — server already processed it
      }
    }

    const updatedPermissions = isAdding
      ? [...member.permissions, permission]
      : member.permissions.filter((perm) => perm !== permission);

    updateMemberPermissions(boardId, membershipId, updatedPermissions);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <UserPlusIcon
            size={20}
            weight="duotone"
            className="text-primary/70"
          />
          Invitar miembros
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">
          Añade nuevos miembros al tablero por email.
        </p>
        <form onSubmit={handleInvite} className="flex items-end gap-3">
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

      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <UserIcon size={20} weight="duotone" className="text-primary/70" />
          Miembros actuales
        </h3>
        <div className="flex flex-col gap-3">
          <MembersList
            members={currentBoard.members}
            pendingRequests={pendingRequests}
            handleRemoveMember={handleRemoveMember}
            togglePermission={togglePermission}
          />
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
            <ClockIcon size={20} weight="duotone" className="text-primary/70" />
            Invitaciones pendientes
          </h3>
          <div className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-neutral-light bg-neutral-light/30 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-neutral-light/70">
                      <UserIcon size={20} className="text-neutral-dark/50" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-dark">
                          {inv.email}
                        </span>
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">
                          Pendiente
                        </span>
                        <span className="rounded-full bg-neutral-light/70 px-2 py-0.5 text-xs text-neutral-dark/70">
                          {inv.role}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-dark/60 mt-0.5">
                        Invitado:{" "}
                        {format(new Date(inv.createdAt), "P", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteInvitation(inv.id, inv.email)}
                    className="cursor-pointer text-neutral-dark/50 hover:text-danger transition-colors"
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
