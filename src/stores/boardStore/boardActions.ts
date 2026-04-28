import { boardsApi } from "@/services/boards";
import type { Board, FullBoard } from "@/shared/types";
import { normalizeBoard, normalizeStage } from "./normalizers";

export function createBoardActions(set: any, get: any) {
  return {
    /* ------------------------ Hydration ------------------------ */

    hydrateBoards: async () => {
      set({ loading: true, error: null });
      try {
        const list = await boardsApi.list();
        const boards = list.map((board) => normalizeBoard(board));
        set({ boards, loading: false });
      } catch (err) {
        set({ error: (err as Error).message, loading: false });
      }
    },

    setCurrentBoard: async (boardId: string | null) => {
      if (!boardId) {
        set({ currentBoard: null });
        return;
      }

      set({ loading: true, error: null });

      try {
        const full: FullBoard = await boardsApi.getFull(boardId);
        const stages = full.stages.map((stage) =>
          normalizeStage(stage, stage.cards, full.members),
        );
        const board = normalizeBoard(full.board, full.members, stages);
        set((state: any) => ({
          currentBoard: board,
          boards: state.boards.some((item: Board) => item.id === board.id)
            ? patchBoardInList(state.boards, board.id, () => board)
            : [...state.boards, board],
          loading: false,
        }));
      } catch (err) {
        set({ error: (err as Error).message, loading: false });
      }
    },

    /* ------------------------ Boards ------------------------ */

    createBoard: async (name: string, background?: string) => {
      const res = await boardsApi.create({ name, background });
      const board = normalizeBoard(res);
      set((state: any) => ({ boards: [...state.boards, board] }));
      return board;
    },

    updateBoard: async (boardId: string, updates: Partial<Board>) => {
      const res = await boardsApi.update(boardId, {
        name: updates.name,
        background: updates.background,
        preferences: updates.preferences as Record<string, unknown> | undefined,
      });
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          name: res.name,
          background: res.background,
          preferences:
            (res.preferences as unknown as Board["preferences"]) ||
            board.preferences,
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            name: res.name,
            background: res.background,
            preferences:
              (res.preferences as unknown as Board["preferences"]) ||
              board.preferences,
          }),
        ),
      }));
    },

    deleteBoard: async (boardId: string) => {
      await boardsApi.remove(boardId);
      set((state: any) => ({
        boards: state.boards.filter((b: Board) => b.id !== boardId),
        currentBoard:
          state.currentBoard?.id === boardId ? null : state.currentBoard,
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
