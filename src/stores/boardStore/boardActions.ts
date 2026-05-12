import { boardsApi } from "@/services/boards";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import type { ActivityType, Board, FullBoardResponse } from "@/shared/types";
import type { BoardState } from "./types";
import { normalizeBoard, normalizeStage } from "./helpers/normalizers";
import { forBoard } from "./helpers/boardHelpers";

function logActivity(
  boardId: string,
  type: ActivityType,
  detail: string,
  meta?: Record<string, unknown>,
) {
  const user = useAuthStore.getState().user;
  const userName =
    user?.profile?.profile.displayName || user?.name || "Usuario";
  useActivityStore
    .getState()
    .log(boardId, { type, user: userName, detail, meta });
}

export function createBoardActions(set: any, get: any) {
  return {
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
        const full: FullBoardResponse = await boardsApi.getFull(boardId);
        const stages = full.stages.map((stage) =>
          normalizeStage(stage, stage.cards),
        );
        const board = normalizeBoard(full.board, full.members, stages);

        set((state: BoardState) => {
          const idx = state.boards.findIndex((b) => b.id === board.id);
          if (idx !== -1) {
            state.boards[idx] = board;
          } else {
            state.boards.push(board);
          }
          state.currentBoard = board;
          state.loading = false;
        });
      } catch (err) {
        set({ error: (err as Error).message, loading: false });
      }
    },

    createBoard: async (name: string, background?: string) => {
      const res = await boardsApi.create({ name, background });
      const board = normalizeBoard(res);
      set((state: BoardState) => { state.boards.push(board); });
      logActivity(board.id, "board_created", `creó el tablero "${name}"`);
      return board;
    },

    updateBoard: async (boardId: string, updates: Partial<Board>) => {
      const board =
        get().currentBoard ?? get().boards.find((board: Board) => board.id === boardId);
      const oldName = board?.name ?? boardId;

      const res = await boardsApi.update(boardId, {
        name: updates.name,
        background: updates.background,
        preferences: updates.preferences as Record<string, unknown> | undefined,
      });

      set((state: BoardState) => {
        forBoard(state, boardId, (board) => {
          board.name = res.name;
          board.background = res.background;
          board.preferences =
            (res.preferences as unknown as Board["preferences"]) ||
            board.preferences;
        });
      });

      if (oldName !== res.name) {
        logActivity(
          boardId,
          "board_renamed",
          `renombró el tablero "${oldName}" a "${res.name}"`,
        );
      }
    },

    deleteBoard: async (boardId: string) => {
      const board =
        get().currentBoard ?? get().boards.find((board: Board) => board.id === boardId);
      const boardName = board?.name ?? boardId;

      await boardsApi.remove(boardId);

      set((state: BoardState) => {
        state.boards = state.boards.filter((board) => board.id !== boardId);
        if (state.currentBoard?.id === boardId) state.currentBoard = null;
      });

      logActivity(
        boardId,
        "board_renamed",
        `eliminó el tablero "${boardName}"`,
      );
    },
  };
}
