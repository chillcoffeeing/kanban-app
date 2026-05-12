import { stagesApi } from "@/services/boards";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import type { ActivityType, Board, Stage } from "@/shared/types";
import type { BoardState } from "./types";
import { normalizeStage } from "./helpers/normalizers";
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

export function createStageActions(set: any, get: any) {
  return {
    addStage: async (boardId: string, name: string) => {
      const res = await stagesApi.create(boardId, name);
      const stage = normalizeStage(res, []);
      set((state: BoardState) => {
        forBoard(state, boardId, (b) => { b.stages.push(stage); });
      });
      logActivity(boardId, "stage_created", `creó la etapa "${name}"`);
      return stage;
    },

    updateStage: async (
      boardId: string,
      stageId: string,
      updates: Partial<Stage>,
    ) => {
      try {
        const board =
          get().currentBoard ??
          get().boards.find((b: Board) => b.id === boardId);
        const oldStage = board?.stages.find((stage: Stage) => stage.id === stageId);
        const oldName = oldStage?.name ?? stageId;

        const res = await stagesApi.update(stageId, { name: updates.name });
        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            const s = b.stages.find((stage) => stage.id === stageId);
            if (s) s.name = res.name;
          });
        });

        if (oldName !== res.name) {
          logActivity(
            boardId,
            "stage_renamed",
            `renombró la etapa "${oldName}" a "${res.name}"`,
          );
        }
      } catch (err) {
        console.error("[boardStore] updateStage API failed:", err);
        set({
          error: `Failed to sync stage update: ${(err as Error).message}`,
        });
      }
    },

    deleteStage: async (boardId: string, stageId: string) => {
      try {
        const board =
          get().currentBoard ??
          get().boards.find((b: Board) => b.id === boardId);
        const stage = board?.stages.find((stage: Stage) => stage.id === stageId);
        const stageName = stage?.name ?? stageId;

        await stagesApi.remove(stageId);
        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            b.stages = b.stages.filter((stage) => stage.id !== stageId);
          });
        });

        logActivity(
          boardId,
          "stage_deleted",
          `eliminó la etapa "${stageName}"`,
        );
      } catch (err) {
        console.error("[boardStore] deleteStage API failed:", err);
        set({
          error: `Failed to sync stage delete: ${(err as Error).message}`,
        });
      }
    },
  };
}
