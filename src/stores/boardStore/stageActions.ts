import { stagesApi } from "@/services/boards";
import type { Board, Stage } from "@/shared/types";
import { normalizeStage } from "./normalizers";

export function createStageActions(set: any, get: any) {
  return {
    /* ------------------------ Stages ------------------------ */

    addStage: async (boardId: string, name: string) => {
      const res = await stagesApi.create(boardId, name);
      const stage = normalizeStage(res, []);
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          stages: [...board.stages, stage],
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            stages: [...board.stages, stage],
          }),
        ),
      }));
      return stage;
    },

    updateStage: async (
      boardId: string,
      stageId: string,
      updates: Partial<Stage>,
    ) => {
      const res = await stagesApi.update(stageId, { name: updates.name });
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          stages: board.stages.map((stage: Stage) =>
            stage.id === stageId ? { ...stage, name: res.name } : stage,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            stages: board.stages.map((stage: Stage) =>
              stage.id === stageId ? { ...stage, name: res.name } : stage,
            ),
          }),
        ),
      }));
    },

    deleteStage: async (boardId: string, stageId: string) => {
      await stagesApi.remove(stageId);
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          stages: board.stages.filter((stage: Stage) => stage.id !== stageId),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            stages: board.stages.filter((stage: Stage) => stage.id !== stageId),
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
