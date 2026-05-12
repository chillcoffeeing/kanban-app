import { generateId } from "@/shared/utils/helpers";
import { ALL_PERMISSIONS } from "@/shared/utils/constants";
import { membersApi } from "@/services/boards";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import type { ActivityType, BoardMember, Permission } from "@/shared/types";
import type { BoardState } from "./types";
import { forBoard } from "./helpers/boardHelpers";

function logActivity(
  boardId: string,
  type: ActivityType,
  detail: string,
  meta?: Record<string, unknown>,
) {
  const user = useAuthStore.getState().user;
  const userName =
    user?.profile?.profile?.displayName || user?.name || "Usuario";
  useActivityStore
    .getState()
    .log(boardId, { type, user: userName, detail, meta });
}

export function createMemberActions(set: any, get: any) {
  return {
    addMember: async (
      boardId: string,
      email: string,
      permissions = ALL_PERMISSIONS,
    ) => {
      try {
        await membersApi.invite(boardId, email, "member");
      } catch {
        /* ignore */
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

      logActivity(boardId, "member_invited", `invitó a "${email}" al tablero`);
    },

    updateMemberPermissions: async (
      boardId: string,
      membershipId: string,
      permissions: Permission[],
    ) => {
      if (!membershipId.startsWith("pending_")) {
        try {
          await membersApi.update(boardId, membershipId, { permissions });
        } catch (err) {
          console.error(
            "[boardStore] updateMemberPermissions API failed:",
            err,
          );
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
          await membersApi.remove(boardId, membershipId);
        } catch (err) {
          console.error("[boardStore] removeMember API failed:", err);
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

      logActivity(
        boardId,
        "member_removed",
        `eliminó a "${memberEmail}" del tablero`,
      );
    },
  };
}
