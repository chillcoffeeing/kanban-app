import { generateId } from "@/shared/utils/helpers";
import { ALL_PERMISSIONS } from "@/shared/utils/constants";
import { membersApi } from "@/services/boards";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import type {
  ActivityType,
  Board,
  BoardMember,
  Permission,
} from "@/shared/types";

function logActivity(
  boardId: string,
  type: ActivityType,
  detail: string,
  meta?: Record<string, unknown>,
) {
  const user = useAuthStore.getState().user;
  const userName = user?.profile?.displayName || user?.name || "Usuario";
  useActivityStore
    .getState()
    .log(boardId, { type, user: userName, detail, meta });
}

export function createMemberActions(set: any, get: any) {
  return {
    /* ------------------------ Members ------------------------
     * Nota: `addMember` en el MVP envía una invitación, pero hasta que el
     * invitado acepte no aparecerá en `members[]` de verdad. Para mantener
     * la UX previa, insertamos un placeholder local con un id temporal.
     * TODO: sustituir por flujo real de invitaciones aceptadas. */

    addMember: async (
      boardId: string,
      email: string,
      permissions = ALL_PERMISSIONS,
    ) => {
      try {
        await membersApi.invite(boardId, email, "member");
      } catch {
        /* ignorar: el placeholder sigue siendo útil localmente */
      }
      const placeholderId = `pending_${generateId()}`;

      const newMember: BoardMember = {
        id: placeholderId,
        email,
        permissions,
        role: "member",
        invitedAt: new Date().toISOString(),
      };

      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          members: [...board.members, newMember],
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            members: [...board.members, newMember],
          }),
        ),
      }));
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
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          members: board.members.map((member: BoardMember) =>
            member.id === membershipId ? { ...member, permissions } : member,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            members: board.members.map((member: BoardMember) =>
              member.id === membershipId ? { ...member, permissions } : member,
            ),
          }),
        ),
      }));
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
        get().currentBoard ?? get().boards.find((b: Board) => b.id === boardId);
      const member = board?.members.find(
        (m: BoardMember) => m.id === membershipId,
      );
      const memberEmail = member?.email ?? membershipId;

      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          members: board.members.filter(
            (member: BoardMember) => member.id !== membershipId,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            members: board.members.filter(
              (member: BoardMember) => member.id !== membershipId,
            ),
          }),
        ),
      }));
      logActivity(
        boardId,
        "member_removed",
        `eliminó a "${memberEmail}" del tablero`,
      );
    },
  };
}

// Helper functions
function patchBoardInList(
  boards: Board[],
  boardId: string,
  patch: (board: Board) => Board,
) {
  return boards.map((board) => (board.id === boardId ? patch(board) : board));
}

function patchCurrent(
  current: Board | null,
  boardId: string,
  patch: (board: Board) => Board,
) {
  return current && current.id === boardId ? patch(current) : current;
}
