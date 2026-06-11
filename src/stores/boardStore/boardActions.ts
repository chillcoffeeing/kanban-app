import { BoardsService } from "@/services/boards";
import { eventBus } from "@/shared/utils/eventBus";
import { handleError } from "@/shared/utils/errorHandler";
import type { Board, FullBoardResponse } from "@/shared/types";
import type { BoardState } from "./types";
import { normalizeBoard, normalizeStage } from "./helpers/normalizers";
import { forBoard } from "./helpers/boardHelpers";
import { clearCardCache } from "./cardActions";

export function createBoardActions(set: any, get: any) {
  return {
    hydrateBoards: async () => {
      set({ loading: true, error: null });
      try {
        const list = await BoardsService.list();
        const boards = list.map((board) => normalizeBoard(board));
        set({ boards, loading: false });
      } catch (err) {
        handleError(err, "Error al cargar los tableros");
        set({ error: (err as Error).message, loading: false });
      }
    },

    setCurrentBoard: async (boardId: string | null) => {
      if (!boardId) {
        set({ currentBoard: null });
        return;
      }

      clearCardCache();
      set({ loading: true, error: null });

      try {
        const full: FullBoardResponse = await BoardsService.getFull(boardId);
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
        handleError(err, "Error al cargar el tablero");
        set({ error: (err as Error).message, loading: false });
      }
    },

    createBoard: async (name: string, background?: string) => {
      try {
        const res = await BoardsService.create({ name, background });
        const board = normalizeBoard(res);
        set((state: BoardState) => { state.boards.push(board); });
        return board;
      } catch (err) {
        throw handleError(err, "Error al crear el tablero");
      }
    },

    updateBoard: async (boardId: string, updates: Partial<Board>) => {
      try {
        const board =
          get().currentBoard ?? get().boards.find((board: Board) => board.id === boardId);
        const oldName = board?.name ?? boardId;

        const res = await BoardsService.update(boardId, {
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
          eventBus.emit("board:renamed", {
            boardId,
            detail: `renombró el tablero "${oldName}" a "${res.name}"`,
            userName: "",
            meta: { oldName, newName: res.name },
          });
        }
      } catch (err) {
        handleError(err, "Error al actualizar el tablero");
      }
    },

    deleteBoard: async (boardId: string) => {
      try {
        await BoardsService.remove(boardId);

        set((state: BoardState) => {
          state.boards = state.boards.filter((board) => board.id !== boardId);
          if (state.currentBoard?.id === boardId) state.currentBoard = null;
        });
      } catch (err) {
        handleError(err, "Error al eliminar el tablero");
      }
    },
  };
}
