import { CardsService } from "@/services/cards";
import { handleError } from "@/shared/utils/errorHandler";
import type { Board, Label } from "@/shared/types";
import type { BoardState } from "./types";
import { forBoard, forCard } from "./helpers/boardHelpers";

export function createCardLabelActions(set: any, get: any) {
  return {
    attachLabel: async (
      boardId: string,
      stageId: string,
      cardId: string,
      labelId: string,
    ) => {
      const board =
        get().currentBoard ??
        get().boards.find((b: Board) => b.id === boardId);
      if (!board) return;

      const label = board.labels?.find((label: Label) => label.id === labelId);
      if (!label) return;

      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.labels.push(label);
        });
      });

      try {
        await CardsService.attachLabel(cardId, labelId);
      } catch (err) {
        set(currentState);
        handleError(err, "Error al añadir etiqueta");
      }
    },

    detachLabel: async (
      boardId: string,
      stageId: string,
      cardId: string,
      labelId: string,
    ) => {
      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.labels = card.labels.filter((label) => label.id !== labelId);
        });
      });

      try {
        await CardsService.detachLabel(cardId, labelId);
      } catch (err) {
        set(currentState);
        handleError(err, "Error al quitar etiqueta");
      }
    },

    createLabel: async (boardId: string, name: string, color: string) => {
      try {
        const res = await CardsService.createLabel(boardId, { name, color });
        const label: Label = { id: res.id, boardId, name: res.name, color: res.color };

        set((state: BoardState) => {
          forBoard(state, boardId, (b) => { b.labels.push(label); });
        });

        return label;
      } catch (err) {
        handleError(err, "Error al crear etiqueta");
        return null;
      }
    },

    deleteLabel: async (boardId: string, labelId: string) => {
      try {
        await CardsService.deleteLabel(labelId);

        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            b.labels = b.labels.filter((label) => label.id !== labelId);
            b.stages.forEach((stage) => {
              stage.cards.forEach((card) => {
                card.labels = card.labels.filter((label) => label.id !== labelId);
              });
            });
          });
        });
      } catch (err) {
        handleError(err, "Error al eliminar etiqueta");
      }
    },
  };
}
