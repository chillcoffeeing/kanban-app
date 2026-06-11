import { StagesService } from "@/services/boards";
import { eventBus } from "@/shared/utils/eventBus";
import { handleError } from "@/shared/utils/errorHandler";
import type { Board, Stage } from "@/shared/types";
import type { BoardState } from "./types";
import { normalizeStage } from "./helpers/normalizers";
import { forBoard } from "./helpers/boardHelpers";

export function createStageActions(set: any, get: any) {
  return {
    addStage: async (boardId: string, name: string) => {
      try {
        const res = await StagesService.create(boardId, name);
        const stage = normalizeStage(res, []);
        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            if (b.stages.some((s) => s.id === stage.id)) return;
            b.stages.push(stage);
          });
        });
        eventBus.emit("stage:created", { boardId, detail: `creó la etapa "${name}"`, userName: "" });
        return stage;
      } catch (err) {
        throw handleError(err, "Error al crear la etapa");
      }
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

        const res = await StagesService.update(stageId, { name: updates.name });
        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            const s = b.stages.find((stage) => stage.id === stageId);
            if (s) s.name = res.name;
          });
        });

        if (oldName !== res.name) {
          eventBus.emit("stage:renamed", {
            boardId,
            detail: `renombró la etapa "${oldName}" a "${res.name}"`,
            userName: "",
            meta: { oldName, newName: res.name },
          });
        }
      } catch (err) {
        handleError(err, "Error al actualizar la etapa");
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

        await StagesService.remove(stageId);

        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            b.stages = b.stages.filter((stage) => stage.id !== stageId);
          });
        });

        eventBus.emit("stage:deleted", { boardId, detail: `eliminó la etapa "${stageName}"`, userName: "" });
      } catch (err) {
        handleError(err, "Error al eliminar la etapa");
        set({
          error: `Failed to sync stage delete: ${(err as Error).message}`,
        });
      }
    },
  };
}
