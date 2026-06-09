import { generateId } from "@/shared/utils/helpers";
import { MembersService } from "@/services/boards";
import { eventBus } from "@/shared/utils/eventBus";
import { handleError } from "@/shared/utils/errorHandler";
import type { BoardMember, Permission } from "@/shared/types";
import type { BoardState } from "./types";
import { forBoard } from "./helpers/boardHelpers";

export function createMemberActions(set: any, get: any) {
  return {
    addMember: async (
      boardId: string,
      email: string,
      permissions: Permission[] = [],
    ) => {
      try {
        await MembersService.invite(boardId, email, "member");
      } catch (err) {
        handleError(err, "Error al invitar al miembro");
      }

      const placeholderId = `pending_${generateId()}`;

      const newMember: BoardMember = {
        id: placeholderId,
        email,
        permissions,
        role: "member",
        invitedAt: new Date().toISOString(),
      };

      set((state: BoardState) => {
        forBoard(state, boardId, (b) => { b.members.push(newMember); });
      });

      eventBus.emit("member:joined", { boardId, detail: `invitó a "${email}" al tablero`, userName: "" });
    },

    updateMemberPermissions: async (
      boardId: string,
      membershipId: string,
      permissions: Permission[],
    ) => {
      if (!membershipId.startsWith("pending_")) {
        try {
          await MembersService.update(boardId, membershipId, { permissions });
        } catch (err) {
          handleError(err, "Error al actualizar permisos del miembro");
          set({
            error: `Failed to sync member permissions: ${(err as Error).message}`,
          });
        }
      }

      set((state: BoardState) => {
        forBoard(state, boardId, (b) => {
          const member = b.members.find((mem) => mem.id === membershipId);
          if (member) member.permissions = permissions;
        });
      });
    },

    removeMember: async (boardId: string, membershipId: string) => {
      if (!membershipId.startsWith("pending_")) {
        try {
          await MembersService.remove(boardId, membershipId);
        } catch (err) {
          handleError(err, "Error al eliminar miembro");
          set({
            error: `Failed to sync member removal: ${(err as Error).message}`,
          });
        }
      }

      const board =
        get().currentBoard ?? get().boards.find((b: any) => b.id === boardId);
      const member = board?.members.find(
        (member: BoardMember) => member.id === membershipId,
      );
      const memberEmail = member?.email ?? membershipId;

      set((state: BoardState) => {
        forBoard(state, boardId, (b) => {
          b.members = b.members.filter((member) => member.id !== membershipId);
        });
      });

      eventBus.emit("member:left", { boardId, detail: `eliminó a "${memberEmail}" del tablero`, userName: "" });
    },
  };
}
