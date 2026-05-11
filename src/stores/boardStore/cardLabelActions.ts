import { cardsApi } from "@/services/cards";
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

      const label = board.labels?.find((l: Label) => l.id === labelId);
      if (!label) return;

      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.labels.push(label);
        });
      });

      try {
        await cardsApi.attachLabel(cardId, labelId);
      } catch {
        set(currentState);
        throw new Error("Failed to attach label");
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
          card.labels = card.labels.filter((l) => l.id !== labelId);
        });
      });

      try {
        await cardsApi.detachLabel(cardId, labelId);
      } catch {
        set(currentState);
        throw new Error("Failed to detach label");
      }
    },

    createLabel: async (boardId: string, name: string, color: string) => {
      const res = await cardsApi.createLabel(boardId, { name, color });
      const label: Label = { id: res.id, boardId, name: res.name, color: res.color };

      set((state: BoardState) => {
        forBoard(state, boardId, (b) => { b.labels.push(label); });
      });

      return label;
    },

    deleteLabel: async (boardId: string, labelId: string) => {
      await cardsApi.deleteLabel(labelId);

      set((state: BoardState) => {
        forBoard(state, boardId, (b) => {
          b.labels = b.labels.filter((l) => l.id !== labelId);
          b.stages.forEach((stage) => {
            stage.cards.forEach((card) => {
              card.labels = card.labels.filter((l) => l.id !== labelId);
            });
          });
        });
      });
    },
  };
}
