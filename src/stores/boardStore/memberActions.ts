import { generateId } from "@/shared/utils/helpers";
import { ALL_PERMISSIONS } from "@/shared/utils/constants";
import { membersApi } from "@/services/boards";
import type { Board, BoardMember, Permission } from "@/shared/types";

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
        boardId,
        userId: placeholderId,
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
    },

    updateMemberPermissions: async (
      boardId: string,
      userId: string,
      permissions: Permission[],
    ) => {
      // Si el userId es un UUID real, sync con backend. Si es placeholder → solo local.
      if (!userId.startsWith("pending_")) {
        try {
          await membersApi.update(boardId, userId, { permissions });
        } catch {
          /* silent */
        }
      }
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          members: board.members.map((member: BoardMember) =>
            member.userId === userId ? { ...member, permissions } : member,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            members: board.members.map((member: BoardMember) =>
              member.userId === userId ? { ...member, permissions } : member,
            ),
          }),
        ),
      }));
    },

    removeMember: async (boardId: string, userId: string) => {
      if (!userId.startsWith("pending_")) {
        try {
          await membersApi.remove(boardId, userId);
        } catch {
          /* silent */
        }
      }
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          members: board.members.filter(
            (member: BoardMember) => member.userId !== userId,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            members: board.members.filter(
              (member: BoardMember) => member.userId !== userId,
            ),
          }),
        ),
      }));
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
